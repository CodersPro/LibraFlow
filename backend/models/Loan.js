/*const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    borrowedAt: { type: Date, default: Date.now },
    dueDate: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    returnedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["active", "returned", "late"],
      default: "active",
    },
  },
  { timestamps: true },
);

loanSchema.virtual("isLate").get(function () {
  if (this.status === "returned") return false;
  return new Date() > this.dueDate;
});

loanSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Loan", loanSchema);
*/ const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    borrowedAt: { type: Date, default: Date.now },
    dueDate: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    returnedAt: { type: Date, default: null },
    status: {
      type: String,
      // "pending"  → demande faite par l'étudiant, pas encore confirmée
      // "active"   → confirmée par le bibliothécaire, livre sorti
      // "late"     → active mais date dépassée
      // "returned" → livre rendu
      enum: ["pending", "active", "late", "returned"],
      default: "pending",
    },
  },
  { timestamps: true },
);

loanSchema.virtual("isLate").get(function () {
  if (this.status === "returned") return false;
  return new Date() > this.dueDate;
});

loanSchema.set("toJSON", { virtuals: true });

loanSchema.index({ user: 1 });
loanSchema.index({ book: 1 });
loanSchema.index({ status: 1 });

module.exports = mongoose.model("Loan", loanSchema);
