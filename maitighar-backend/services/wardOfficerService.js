const mongoose = require("mongoose");
const WardService = require("WardService");
const bcrypt = require("bcrypt");

class WardOfficerService {
  static async createWardOfficer({
    username,
    email,
    password,
    localGovId,
    wardNumber,
    role,
    contactNumber,
    name,
  }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    const Ward = mongoose.model("Ward");
    const User = mongoose.model("User");

    try {
      // First get or create the ward
      const ward = await WardService.getOrCreateWard(localGovId, wardNumber);

      // Create user
      const user = new User({
        username,
        email,
        passwordHash: await bcrypt.hash(password, 10),
        role: "wardOfficer",
      });
      await user.save({ session });

      // Create ward officer
      const wardOfficer = new WardOfficer({
        user: user._id,
        name: name || username,
        contactNumber,
        email,
        ward: ward._id,
        localGov: localGovId,
        role,
      });
      await wardOfficer.save({ session });

      // Update ward with new officer
      await Ward.findByIdAndUpdate(
        ward._id,
        { $addToSet: { officers: wardOfficer._id } },
        { session },
      );

      // Update user with ward officer reference
      user.wardOfficerProfile = wardOfficer._id;
      await user.save({ session });

      await session.commitTransaction();
      return { user, wardOfficer, ward };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
