import type { AnyDoc, AppData } from "../types";
import { currency } from "../utils/format";
import { planDurationLabel, planIncludesTrainer } from "../utils/membership";

export type SelectOption = string | { label: string; value: string };
export type FieldConfig = {
  name: string;
  label: string;
  type?: string;
  options?: SelectOption[];
  required?: boolean;
  readOnly?: boolean;
  hidden?: boolean;
  placeholder?: string;
};

export const fields: Record<string, FieldConfig[]> = {
  members: [
    { name: "memberId", label: "Member ID", readOnly: true, placeholder: "Auto-generated" }, { name: "name", label: "Full Name", required: true }, { name: "mobile", label: "Mobile", required: true },
    { name: "email", label: "Email", type: "email" }, { name: "gender", label: "Gender", options: ["Male", "Female", "Other"] },
    { name: "dob", label: "Date of Birth", type: "date" }, { name: "address", label: "Address" }, { name: "emergencyContact", label: "Emergency Contact" },
    { name: "membershipPlan", label: "Membership Plan", required: true }, { name: "planPrice", label: "Plan Price", type: "number", readOnly: true }, { name: "discount", label: "Discount", type: "number" }, { name: "billingAmount", label: "Final Billing Amount", type: "number", readOnly: true }, { name: "joiningDate", label: "Joining Date", type: "date" },
    { name: "startDate", label: "Start Date", type: "date", required: true }, { name: "expiryDate", label: "Expiry Date", type: "date", readOnly: true },
    { name: "status", label: "Status", options: ["Active", "Inactive", "Frozen"], required: true }, { name: "assignedTrainer", label: "Assigned Trainer" },
    { name: "workoutPlan", label: "Workout Plan" }, { name: "dietPlan", label: "Diet Plan" }, { name: "profilePhoto", label: "Profile Photo URL" }
  ],
  visitors: [
    { name: "visitorId", label: "Visitor ID" }, { name: "name", label: "Full Name", required: true }, { name: "mobile", label: "Mobile", required: true },
    { name: "email", label: "Email", type: "email" }, { name: "gender", label: "Gender", options: ["Male", "Female", "Other"] }, { name: "age", label: "Age", type: "number" },
    { name: "address", label: "Address" }, { name: "visitDate", label: "Visit Date", type: "date", required: true }, { name: "source", label: "Lead Source", options: ["Walk-in", "Referral", "Instagram", "Facebook", "Google", "Phone Call", "Website", "Other"] },
    { name: "interest", label: "Interest / Goal", options: ["Weight Loss", "Muscle Gain", "Strength Training", "Cardio", "General Fitness", "Personal Training", "Diet Consultation"] },
    { name: "preferredPlan", label: "Preferred Membership" }, { name: "preferredTrainer", label: "Preferred Trainer" },
    { name: "trialDate", label: "Trial Date", type: "date" }, { name: "followUpDate", label: "Follow Up Date", type: "date" },
    { name: "status", label: "Status", options: ["New", "Interested", "Follow Up", "Trial Booked", "Converted", "Not Interested"], required: true },
    { name: "remarks", label: "Remarks" }
  ],
  memberships: [
    { name: "name", label: "Plan Name", required: true },
    { name: "durationType", label: "Duration Type", options: ["Days", "Months"], required: true },
    { name: "durationValue", label: "Duration (Days / Months)", type: "number", required: true },
    { name: "trainerIncluded", label: "Trainer Access", options: ["Without Trainer", "With Trainer"], required: true },
    { name: "price", label: "Price", type: "number", required: true },
    { name: "status", label: "Status", options: ["Active", "Inactive"], required: true },
    { name: "description", label: "Description" }
  ],
  trainers: [
    { name: "name", label: "Full Name", required: true }, { name: "mobile", label: "Mobile", required: true }, { name: "email", label: "Email", type: "email" },
    { name: "address", label: "Address" }, { name: "experience", label: "Experience" }, { name: "specialization", label: "Specialization", required: true },
    { name: "salary", label: "Salary", type: "number" }, { name: "status", label: "Status", options: ["Active", "Inactive"], required: true }, { name: "profilePhoto", label: "Profile Photo URL" }
  ],
  staff: [
    { name: "name", label: "Full Name", required: true }, { name: "username", label: "Username", required: true }, { name: "password", label: "New Password", type: "password" },
    { name: "mobile", label: "Mobile" }, { name: "email", label: "Email", type: "email" }, { name: "address", label: "Address" },
    { name: "role", label: "Role", options: ["Super Administrator", "Manager", "Reception Staff", "Trainer"], required: true },
    { name: "salary", label: "Salary", type: "number" }, { name: "status", label: "Status", options: ["Active", "Inactive"], required: true }
  ],
  payments: [
    { name: "memberName", label: "Member Name", required: true }, { name: "invoiceNo", label: "Invoice Number" }, { name: "amount", label: "Amount", type: "number", required: true },
    { name: "method", label: "Method", options: ["Cash", "UPI", "Bank Transfer", "Credit Card", "Debit Card", "Card"], required: true },
    { name: "type", label: "Payment Type", options: ["Membership", "Membership Renewal", "Refund", "Pending Due"], required: true },
    { name: "status", label: "Status", options: ["Paid", "Pending", "Refunded"], required: true }, { name: "paymentDate", label: "Payment Date", type: "date", required: true }, { name: "notes", label: "Notes" }
  ],
  workouts: [
    { name: "name", label: "Plan Name", required: true }, { name: "category", label: "Category", options: ["Weight Loss", "Muscle Gain", "Strength Training", "Cardio", "Beginner", "Intermediate", "Advanced"], required: true },
    { name: "exerciseName", label: "Exercises" }, { name: "sets", label: "Sets", type: "number" }, { name: "repetitions", label: "Repetitions", type: "number" },
    { name: "duration", label: "Duration" }, { name: "restTime", label: "Rest Time" }, { name: "instructions", label: "Instructions" }, { name: "trainerNotes", label: "Trainer Notes" }, { name: "status", label: "Status", options: ["Active", "Inactive"], required: true }
  ],
  diets: [
    { name: "name", label: "Plan Name", required: true }, { name: "category", label: "Template", required: true }, { name: "breakfast", label: "Breakfast" }, { name: "lunch", label: "Lunch" },
    { name: "dinner", label: "Dinner" }, { name: "snacks", label: "Snacks" }, { name: "supplements", label: "Supplements" }, { name: "notes", label: "Nutrition Notes" },
    { name: "recommendations", label: "Trainer Recommendations" }, { name: "status", label: "Status", options: ["Active", "Inactive"], required: true }
  ],
  equipment: [
    { name: "name", label: "Equipment Name", required: true }, { name: "category", label: "Category", required: true }, { name: "purchaseDate", label: "Purchase Date", type: "date" },
    { name: "purchaseCost", label: "Purchase Cost", type: "number" }, { name: "vendor", label: "Vendor" },
    { name: "condition", label: "Condition", options: ["Excellent", "Good", "Needs Service", "Damaged"], required: true },
    { name: "availability", label: "Availability", options: ["Available", "In Use", "Under Maintenance"], required: true },
    { name: "maintenanceDate", label: "Next Maintenance", type: "date" }, { name: "serviceHistory", label: "Service / Repair Records" }, { name: "status", label: "Status", options: ["Active", "Inactive"] }
  ]
};

export const tableColumns: Record<string, string[]> = {
  members: ["memberId", "name", "mobile", "membershipPlan", "billingAmount", "expiryDate", "status"],
  visitors: ["visitorId", "name", "mobile", "source", "preferredPlan", "followUpDate", "status"],
  memberships: ["name", "durationType", "durationValue", "trainerIncluded", "price", "status"],
  trainers: ["name", "mobile", "specialization", "experience", "salary", "status"],
  staff: ["name", "username", "role", "mobile", "status"],
  payments: ["invoiceNo", "memberName", "amount", "method", "status", "paymentDate"],
  workouts: ["name", "category", "exerciseName", "duration", "status"],
  diets: ["name", "category", "breakfast", "lunch", "status"],
  equipment: ["name", "category", "condition", "availability", "maintenanceDate", "status"]
};

function optionsFrom(rows: AnyDoc[], key = "name", formatter?: (row: AnyDoc) => SelectOption) {
  return rows.map((row) => formatter ? formatter(row) : row[key]).filter(Boolean);
}

export function fieldsFor(collection: string, data: AppData, memberValues?: Record<string, any>) {
  const selectedPlan = memberValues?.membershipPlan
    ? data.memberships.find((p) => p.name === memberValues.membershipPlan)
    : null;

  return (fields[collection] || []).map((field) => {
    if (collection === "members" && field.name === "membershipPlan") {
      return {
        ...field,
        options: optionsFrom(data.memberships, "name", (plan) => ({
          value: plan.name,
          label: `${plan.name} - ${currency(Number(plan.price || 0))} / ${planDurationLabel(plan)}${planIncludesTrainer(plan) ? " + Trainer" : ""}`
        }))
      };
    }
    if (collection === "members" && field.name === "assignedTrainer") {
      const showTrainer = selectedPlan ? planIncludesTrainer(selectedPlan) : true;
      return {
        ...field,
        hidden: !showTrainer,
        required: showTrainer,
        options: ["", ...optionsFrom(data.trainers)]
      };
    }
    if (collection === "members" && field.name === "workoutPlan") return { ...field, options: ["", ...optionsFrom(data.workouts)] };
    if (collection === "members" && field.name === "dietPlan") return { ...field, options: ["", ...optionsFrom(data.diets)] };
    if (collection === "visitors" && field.name === "preferredPlan") return { ...field, options: ["", ...optionsFrom(data.memberships, "name", (plan) => ({ value: plan.name, label: `${plan.name} - ${currency(Number(plan.price || 0))} / ${planDurationLabel(plan)}` }))] };
    if (collection === "visitors" && field.name === "preferredTrainer") return { ...field, options: ["", ...optionsFrom(data.trainers)] };
    if (collection === "payments" && field.name === "memberName") return { ...field, options: optionsFrom(data.members, "name", (member) => ({ value: member.name, label: `${member.name} - Due ${currency(Number(member.billingAmount || 0))}` })) };
    return field;
  }).filter((field) => !field.hidden);
}
