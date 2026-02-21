const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Le titre est obligatoire"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "L'auteur est obligatoire"],
      trim: true,
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    genre: {
      type: String,
      enum: [
        "Informatique",
        "Mathématiques",
        "Sciences",
        "Gestion",
        "Littérature",
        "Autre",
      ],
      default: "Autre",
    },
    description: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    totalCopies: { type: Number, required: true, min: 1, default: 1 },
    availableCopies: {
      type: Number,
      default: function () {
        return this.totalCopies;
      },
    },
    publishedYear: Number,
    publisher: String,
  },
  { timestamps: true },
);

bookSchema.virtual("isAvailable").get(function () {
  return this.availableCopies > 0;
});

bookSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Book", bookSchema);
