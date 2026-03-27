import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type Member = {
    id : Nat;
    serial : Text;
    name : Text;
    joinDate : Text;
  };

  type Payment = {
    id : Nat;
    memberId : Nat;
    month : Nat;
    year : Nat;
    paidDate : Text;
    amount : Float;
  };

  module Payment {
    public func compare(payment1 : Payment, payment2 : Payment) : Order.Order {
      Nat.compare(payment1.id, payment2.id);
    };
  };

  type DashboardStats = {
    totalCollected : Float;
    paidThisMonth : Nat;
    unpaidThisMonth : Nat;
    totalUnpaid : Nat;
    totalMembers : Nat;
  };

  type MemberPaymentStatus = {
    member : Member;
    paid : Bool;
    paymentDetails : ?Payment;
  };

  public type UserProfile = {
    name : Text;
  };

  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextMemberId = 1;
  var nextPaymentId = 1;

  let memberMap = Map.empty<Nat, Member>();
  let paymentMap = Map.empty<Nat, Payment>();

  let MEMBERSHIP_FEE : Float = 100.0;

  func currentTimestampToISO() : Text {
    let now = Time.now();
    // Simplified timestamp conversion. Replace with proper utility if needed.
    now.toText();
  };

  func getPaymentByMonthYearInternal(month : Nat, year : Nat) : [Payment] {
    paymentMap.values().toArray().filter(
      func(p) {
        p.month == month and p.year == year
      }
    );
  };

  func trimPaymentsHelper(paymentsList : [Payment], remaining : Nat) : [Payment] {
    Array.tabulate(
      remaining,
      func(i) {
        paymentsList[i];
      },
    );
  };

  // User Profile Management Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Member Management Functions (Admin-only)
  public shared ({ caller }) func addMember(name : Text, serial : Text, joinDate : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add members");
    };

    let memberId = nextMemberId;
    nextMemberId += 1;

    if (serial == "") {
      Runtime.trap("Serial cannot be empty");
    };
    if (name == "") {
      Runtime.trap("Name cannot be empty");
    };

    let newMember : Member = {
      id = memberId;
      serial;
      name;
      joinDate;
    };
    memberMap.add(memberId, newMember);
    memberId;
  };

  public shared ({ caller }) func updateMember(id : Nat, serial : Text, name : Text, joinDate : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update members");
    };

    if (not memberMap.containsKey(id)) {
      Runtime.trap("Member not found");
    };
    if (serial == "") {
      Runtime.trap("Serial cannot be empty");
    };
    if (name == "") {
      Runtime.trap("Name cannot be empty");
    };

    let updatedMember : Member = {
      id;
      serial;
      name;
      joinDate;
    };
    memberMap.add(id, updatedMember);
  };

  public shared ({ caller }) func deleteMember(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete members");
    };

    if (not memberMap.containsKey(id)) {
      Runtime.trap("Member not found");
    };
    memberMap.remove(id);
  };

  public query ({ caller }) func getAllMembers() : async [Member] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view members");
    };

    let membersArray = memberMap.values().toArray();
    membersArray;
  };

  // Payment Management Functions (Admin-only for modifications)
  public shared ({ caller }) func recordPayment(memberId : Nat, month : Nat, year : Nat, amount : Float) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can record payments");
    };

    if (not memberMap.containsKey(memberId)) {
      Runtime.trap("Member not found");
    };

    let paymentId = nextPaymentId;
    nextPaymentId += 1;

    let newPayment : Payment = {
      id = paymentId;
      memberId;
      month;
      year;
      paidDate = currentTimestampToISO();
      amount;
    };
    paymentMap.add(paymentId, newPayment);
    paymentId;
  };

  public shared ({ caller }) func deletePayment(paymentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete payments");
    };

    if (not paymentMap.containsKey(paymentId)) {
      Runtime.trap("Payment not found");
    };
    paymentMap.remove(paymentId);
  };

  public query ({ caller }) func getPaymentsByMonthYear(month : Nat, year : Nat) : async [Payment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payments");
    };

    return trimPaymentsHelper(
      getPaymentByMonthYearInternal(month, year),
      getPaymentByMonthYearInternal(month, year).size(),
    );
  };

  public query ({ caller }) func getAllPayments() : async [Payment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payments");
    };

    return trimPaymentsHelper(paymentMap.values().toArray(), paymentMap.size()).sort();
  };

  // Dashboard and Reporting Functions (User-level access)
  public query ({ caller }) func getDashboardStats(currentMonth : Nat, currentYear : Nat) : async DashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dashboard stats");
    };

    let allPayments = getPaymentByMonthYearInternal(currentMonth, currentYear);

    var totalCollected = 0.0;
    for (payment in paymentMap.values()) {
      totalCollected += payment.amount;
    };

    let paidThisMonth = allPayments.size();
    let unpaidThisMonth = memberMap.size() - paidThisMonth;

    var totalUnpaid = 0;
    for (member in memberMap.values()) {
      for (month in Nat.range(1, 13)) {
        let hasPayment = paymentMap.values().any(
          func(p) {
            p.memberId == member.id and p.month == month and p.year == currentYear
          }
        );
        if (not hasPayment) {
          totalUnpaid += 1;
        };
      };
    };

    let totalMembers = memberMap.size();

    {
      totalCollected;
      paidThisMonth;
      unpaidThisMonth;
      totalUnpaid;
      totalMembers;
    };
  };

  public query ({ caller }) func getMonthlyReport(month : Nat, year : Nat) : async [MemberPaymentStatus] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view monthly reports");
    };

    let allMembersArray = memberMap.values().toArray();

    let report = allMembersArray.map(
      func(member) {
        let payment = paymentMap.values().find(
          func(p) {
            p.memberId == member.id and p.month == month and p.year == year
          }
        );
        {
          member;
          paid = payment != null;
          paymentDetails = payment;
        };
      }
    );
    report;
  };
};
