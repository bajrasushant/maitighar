const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  responsible: {
    type: String,
    enum: ["ward", "department"],
    required: true,
  },
  assigned_province: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Province",
    required: true,
  },
  assigned_district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "District",
    required: true,
  },
  assigned_local_gov: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LocalGov",
    required: function () {
      return this.responsible === "ward";
    },
  },
  assigned_ward: {
    type: Number,
    required: function () {
      return this.responsible === "ward";
    },

    validate: {
      validator: async function (value) {
        if (!this.assigned_local_gov) {
          return true;
        }
        const localGov = await mongoose.model("LocalGov").findById(this.assigned_local_gov);
        return value > 0 && value <= localGov.number_of_wards;
      },
      message: "Assigned ward must be within the range of the local government's number of wards.",
    },
  },
  // Assigned department or ward based on the responsibility
  assigned_department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: function () {
      return this.responsible === "department";
    },
  },
  // role: String,
  //   department: {
  //       type: String,
  //       enum: ['Local Government', 'Central Government'],
  //       default: 'Local Government',
  //     },
  // department: {
  //   type: String,
  //   enum: departments,
  //   required: true,
  //   unique: true,
  // },
});

adminSchema.pre("save", async function (next) {
  if (this.responsible === "ward" && this.assigned_local_gov && this.assigned_ward) {
    const existingAdminForWard = await mongoose.model("Admin").findOne({
      assigned_local_gov: this.assigned_local_gov,
      assigned_ward: this.assigned_ward,
      _id: { $ne: this._id },
    });

    if (existingAdminForWard) {
      return next(
        new Error(
          `Ward ${this.assigned_ward} is already assigned to another admin in this local government.`,
        ),
      );
    }
  }

  if (this.responsible === "department" && this.assigned_department) {
    const existingAdminForDepartment = await mongoose.model("Admin").findOne({
      assigned_department: this.assigned_department,
      _id: { $ne: this._id },
    });

    if (existingAdminForDepartment) {
      return next(new Error("Department is already assigned to another admin."));
    }
  }

  next();
});

adminSchema.plugin(uniqueValidator);

adminSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
    returnedObject.department = document.assigned_district || document.assigned_ward;
  },
});

module.exports = mongoose.model("Admin", adminSchema);
