const cron = require("node-cron");
const Company = require("../modules/company/company.model");
const User = require("../modules/user/user.model");

const expireCompanyPlan = () => {
  cron.schedule("*/2 * * * *", async () => {
    try {
      console.log("Running company plan expiry cron...");

      const now = new Date();

      // 1️⃣ Find expired companies
      const expiredCompanies = await Company.find({
        planExpiryDate: { $lte: now },
        status: "active"
      }).select("_id");

      if (expiredCompanies.length === 0) {
        console.log("No expired companies found");
        return;
      }

      const companyIds = expiredCompanies.map(c => c._id);

      // 2️⃣ Update company status
      await Company.updateMany(
        { _id: { $in: companyIds } },
        {
          $set: {
            status: "inactive",
            isActive: false
          }
        }
      );

      // 3️⃣ Update users of those companies
      const updatedUsers = await User.updateMany(
        { company_Id: { $in: companyIds } },
        {
          $set: {
            status: "inactive",
            isActive: false
          }
        }
      );

      console.log("Expired company IDs:", companyIds);
      console.log(`${updatedUsers.modifiedCount} users deactivated`);

    } catch (error) {
      console.error("Cron job error:", error);
    }
  });
};

module.exports = expireCompanyPlan;