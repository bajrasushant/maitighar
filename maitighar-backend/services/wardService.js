const mongoose = require("mongoose");
class WardService {
  static async getOrCreateWard(localGovId, wardNumber) {
    const Ward = mongoose.model("Ward");
    const LocalGov = mongoose.model("LocalGov");

    // Validate local government and ward number
    const localGov = await LocalGov.findById(localGovId);
    if (!localGov) {
      throw new Error("Local government not found");
    }

    if (wardNumber < 1 || wardNumber > localGov.number_of_wards) {
      throw new Error(`Ward number must be between 1 and ${localGov.number_of_wards}`);
    }

    // Try to find existing ward
    let ward = await Ward.findOne({
      localGov: localGovId,
      number: wardNumber,
    });

    // Create if doesn't exist
    if (!ward) {
      ward = await Ward.create({
        number: wardNumber,
        localGov: localGovId,
      });
    }

    return ward;
  }

  static async getWardStats(localGovId, wardNumber) {
    const ward = await Ward.findOne({
      localGov: localGovId,
      number: wardNumber,
    })
      .populate("officers")
      .lean();

    if (!ward) {
      return {
        exists: false,
        officerCount: 0,
        isActive: false,
      };
    }

    return {
      exists: true,
      officerCount: ward.officers.length,
      isActive: ward.status === "active",
      ward: ward,
    };
  }
}
