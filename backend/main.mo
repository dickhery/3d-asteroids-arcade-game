import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module Profile {
    public type T = {
      userId : Principal;
      username : Text;
      highScore : Nat;
      survivalTime : Nat;
      wins : Nat;
    };

    public func compareByHighScore(a : T, b : T) : Order.Order {
      Nat.compare(b.highScore, a.highScore);
    };
  };

  module Submission {
    public type T = {
      username : Text;
      score : Nat;
      survivalTime : Nat;
      timestamp : Int;
    };

    public func compareByScore(a : T, b : T) : Order.Order {
      Nat.compare(b.score, a.score);
    };
  };

  public type LeaderboardStats = {
    topPlayer : Text;
    longestSurvivor : Text;
    mostWinsPlayer : Text;
  };

  let profiles = Map.empty<Principal, Profile.T>();
  var leaderboard = Array.empty<Submission.T>();

  public type GameResult = {
    score : Nat;
    survivalTime : Nat;
    timestamp : Int;
  };

  public type UserProfile = Profile.T;

  public shared ({ caller }) func registerUsername(username : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register");
    };
    if (profiles.containsKey(caller)) {
      Runtime.trap("Username already exists");
    };
    let newProfile : Profile.T = {
      userId = caller;
      username;
      highScore = 0;
      survivalTime = 0;
      wins = 0;
    };
    profiles.add(caller, newProfile);
  };

  public query ({ caller }) func getCallerProfile() : async Profile.T {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access profiles");
    };
    switch (profiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile not found. Please register a username first.") };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access profiles");
    };
    profiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };
    profiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async Profile.T {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (profiles.get(user)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile not found for the specified user.") };
    };
  };

  public query ({ caller }) func getUserHighScore(user : Principal) : async Nat {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own high score");
    };
    switch (profiles.get(user)) {
      case (?profile) { profile.highScore };
      case (null) { Runtime.trap("User does not exist") };
    };
  };

  public query ({ caller }) func getAllProfiles() : async [Profile.T] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all profiles");
    };
    Array.tabulate<Profile.T>(
      profiles.size(),
      func(i) {
        let profilesArray = profiles.toArray();
        if (i < profilesArray.size()) {
          profilesArray[i].1;
        } else {
          Runtime.trap("Index out of bounds");
        };
      },
    ).sort(Profile.compareByHighScore);
  };

  public shared ({ caller }) func submitGameResults(score : Nat, survivalTime : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit game results");
    };
    let timestamp = Time.now();
    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Caller profile does not exist. Please register.") };
      case (?profile) {
        let updatedProfile : Profile.T = {
          userId = profile.userId;
          username = profile.username;
          highScore = getNewHighScore(profile, score, survivalTime);
          survivalTime = getNewLongestSurvival(profile, survivalTime);
          wins = profile.wins + 1;
        };

        profiles.add(caller, updatedProfile);

        addLeaderboardEntry(profile.username, score, survivalTime, timestamp);
        if (score > 0) {
          updateLeaderboard();
        };
      };
    };
  };

  func getNewHighScore(profile : Profile.T, newScore : Nat, newSurvivalTime : Nat) : Nat {
    if (newScore > profile.highScore) {
      newScore;
    } else if (newScore == profile.highScore and newSurvivalTime > profile.survivalTime) {
      newScore;
    } else {
      profile.highScore;
    };
  };

  func getNewLongestSurvival(profile : Profile.T, newSurvivalTime : Nat) : Nat {
    if (newSurvivalTime > profile.survivalTime) {
      newSurvivalTime;
    } else { profile.survivalTime };
  };

  func addLeaderboardEntry(username : Text, score : Nat, survivalTime : Nat, timestamp : Int) {
    let submission : Submission.T = {
      username;
      score;
      survivalTime;
      timestamp;
    };
    leaderboard := leaderboard.concat([submission]);
    updateLeaderboard();
  };

  public query ({ caller }) func getTopScores() : async [Submission.T] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view leaderboard");
    };
    if (leaderboard.size() == 0) {
      Runtime.trap("Leaderboard is empty. Play a game first to populate leaderboard.");
    } else {
      let sorted = getSortedByScore();
      let length = if (sorted.size() < 10) { sorted.size() } else { 10 };
      Array.tabulate(length, func(i) { sorted[i] });
    };
  };

  public query ({ caller }) func getLeaderboardStats() : async LeaderboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view leaderboard stats");
    };
    let leaderboardSize = leaderboard.size();
    if (leaderboardSize == 0) {
      Runtime.trap("Leaderboard is empty. Play a game first to populate leaderboard.");
    } else if (leaderboardSize > 0) {
      let topPlayer = if (leaderboardSize > 0) { leaderboard[0].username } else { "" };
      let longestSurvivor = switch (findLongestSurvivor()) {
        case (?survivor) { survivor.username };
        case (null) { "" };
      };
      let mostWinsPlayer = switch (findMostWinsPlayer()) {
        case (?player) { player.username };
        case (null) { "" };
      };
      {
        topPlayer;
        longestSurvivor;
        mostWinsPlayer;
      };
    } else {
      Runtime.trap("Leaderboard is empty. Play a game first to populate leaderboard.");
    };
  };

  func findLongestSurvivor() : ?Submission.T {
    var longest : ?Submission.T = null;
    for (submission in leaderboard.values()) {
      switch (longest) {
        case (null) { longest := ?submission };
        case (?current) {
          if (submission.survivalTime > current.survivalTime) {
            longest := ?submission;
          };
        };
      };
    };
    longest;
  };

  func findMostWinsPlayer() : ?Profile.T {
    var mostWins : ?Profile.T = null;
    for (profile in profiles.values()) {
      switch (mostWins) {
        case (null) { mostWins := ?profile };
        case (?current) {
          if (profile.wins > current.wins) {
            mostWins := ?profile;
          };
        };
      };
    };
    mostWins;
  };

  func getSortedByScore() : [Submission.T] {
    let size = leaderboard.size();
    if (size == 0) {
      return [];
    };

    Array.tabulate(
      size,
      func(i) {
        let leaderboardArray = leaderboard;
        if (i < leaderboardArray.size()) {
          leaderboardArray[i];
        } else {
          Runtime.trap("Index out of bounds");
        };
      },
    ).sort(Submission.compareByScore);
  };

  func updateLeaderboard() {
    if (leaderboard.size() > 10) {
      let entries = leaderboard;
      if (entries.size() > 10) {
        leaderboard := entries.sort(Submission.compareByScore).sliceToArray(0, 10);
      };
    };
  };

  public query ({ caller }) func validateUsername(username : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can validate usernames");
    };
    not (isUsernameTaken(username));
  };

  func isUsernameTaken(username : Text) : Bool {
    let usernameTest = username;
    profiles.values().find(func(profile) { profile.username == usernameTest }) != null;
  };

  // Stripe integration
  var configuration : ?Stripe.StripeConfiguration = null;

  public query ({ caller }) func isStripeConfigured() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check Stripe configuration");
    };
    configuration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    configuration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (configuration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
