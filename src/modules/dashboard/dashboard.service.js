const Company = require("../../modules/company/company.model");
const User = require("../../modules/user/user.model");
const Project = require("../../modules/project/project.models")
const ApiError = require("../../utils/ApiError");
const mongoose = require('mongoose')

// const getCompanyService = async (queryParams, currentUser) => {

//     let {
//         page = 1,
//         limit = 10,
//         sortKey = "createdAt",
//         sortOrder = "desc",
//         search,
//         ...filters
//     } = queryParams;

//     const pageNumber = parseInt(page) || 1;
//     const limitNumber = parseInt(limit) || 10;
//     const skip = (pageNumber - 1) * limitNumber;

//     let matchStage = {
//         isActive: true,
//         isDelete: false
//     };

//     // 🟢 Role-based filtering
//     if (currentUser?.role === "Admin") {
//         matchStage._id = new mongoose.Types.ObjectId(currentUser.company_Id);
//     }

//     // Dynamic filters
//     Object.keys(filters).forEach(key => {
//         if (filters[key]) {
//             const values = filters[key].split(",");

//             if (key === "_id") {
//                 matchStage[key] = {
//                     $in: values.map(id => new mongoose.Types.ObjectId(id))
//                 };
//             } else {
//                 matchStage[key] = { $in: values };
//             }
//         }
//     });

//     // Search
//     if (search) {
//         matchStage.name = { $regex: search, $options: "i" };
//     }

//     const sortStage = {
//         [sortKey]: sortOrder === "asc" ? 1 : -1
//     };

//     const [company, totalRecords] = await Promise.all([
//         Company.aggregate([
//             { $match: matchStage },
//             { $project: { isActive: 0, isDelete: 0 } },
//             { $sort: sortStage },
//             { $skip: skip },
//             { $limit: limitNumber }
//         ]),
//         Company.aggregate([
//             { $match: matchStage },
//             { $count: "count" }
//         ])
//     ]);

//     const count = totalRecords[0]?.count || 0;

//     return {
//         count,
//         page: pageNumber,
//         limit: limitNumber,
//         company
//     };
// };



// const createCompanyService = async ({ name, company_Id, userId }) => {

//     if (!name || !name.trim()) {
//         throw new ApiError(400, "Company name is required");
//     }

//     // Optional: check if company already exists
//     const existingCompany = await Company.findOne({ name });

//     if (existingCompany) {
//         throw new ApiError(409, "Company already exists");
//     }

//     const company = await Company.create({
//         name,
//         company_Id,
//         S_Admin_Id: userId,
//     });

//     return company;
// };


// const updateCompanyService = async (user, data) => {

//     const response = await Company.findByIdAndUpdate(user.company_Id, data, { new: true })

//     return response;

// }

// const deleteCompanyService = async (user) => {

//     // Soft Deleting
//     await Company.findByIdAndUpdate(user.company_Id, {
//         isDelete: true,
//         isActive: false
//     });

//     let company = "Company is deleted"
//     return company
// }
//


// S_Admin Dashboard Service
const getS_AdminDashboardService = async () => {

    // Run all queries in parallel (IMPORTANT for performance)
    const [
        companyStats,
        userStats,
        projectStats,
        userGrowth
    ] = await Promise.all([

        // 🏢 Company Count
        Company.aggregate([
            {
                $group: {
                    _id: null,
                    totalCompanies: { $sum: 1 }
                }
            }
        ]),

        User.aggregate([
            {
                $group: {
                    _id: null,

                    // Total Users
                    totalUsers: { $sum: 1 },

                    // Active Users
                    activeUsers: {
                        $sum: { $toInt: "$isActive" }
                    },

                    // Active Admins
                    activeAdmins: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$role", "Admin"] },
                                        { $eq: ["$isActive", true] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]),

        // 📁 Project Count
        Project.aggregate([
            {
                $group: {
                    _id: null,
                    totalProjects: { $sum: 1 }
                }
            }
        ]),

        // 📈 User Growth (last 7 days example)
        User.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(new Date() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ])
    ]);
    console.log(userStats);

    return {
        role: "S_Admin",

        stats: {
            totalCompanies: companyStats[0]?.totalCompanies || 0,
            totalUsers: userStats[0]?.totalUsers || 0,
            totalAdmins: userStats[0]?.activeAdmins || 0,
            activeUsers: userStats[0]?.activeUsers || 0,
            totalProjects: projectStats[0]?.totalProjects || 0
        },

        charts: {
            userGrowth: userGrowth || []
        }
    };
};

// Admin Task Service
const Task = require("../../modules/task/task.model");
const File = require("../../modules/file/file.model");
const Comment = require("../../modules/comment/comment.model");
const TaskHistory = require("../../modules/history/history.model");

const getAdminDashboardService = async (adminId) => {

    const adminObjectId = new mongoose.Types.ObjectId("69b3e106951ad393cdea299a");
    const admin = await User.findById("69b3e106951ad393cdea299a")
    console.log("dash", admin);

    const [
        projectStats,
        userStats,
        taskStats,
        fileStats
    ] = await Promise.all([

        // 📁 Projects created by Admin
        Project.aggregate([
            { $match: { created_by: adminObjectId } },
            { $count: "totalProjects" }
        ]),

        // 👥 Users under Admin
        User.aggregate([
            { $match: { createdBy: adminObjectId } },
            { $count: "totalUsers" }
        ]),

        Task.aggregate([
            { $match: { reportTo: adminObjectId } },
            { $count: "totalTasks" }
        ]),

        // 📂 Files under Admin's Tasks
        File.aggregate([
            { $match: { companyId: admin.company_Id } },
            { $count: "totalFiles" }
        ])
    ]);


    console.log(projectStats,
        userStats,
        taskStats,
        fileStats);


    return {
        role: "Admin",
        stats: {
            totalProjects: projectStats[0]?.totalProjects || 0,
            totalUsers: userStats[0]?.totalUsers || 0,
            totalTasks: taskStats[0]?.totalTasks || 0,
            totalFiles: fileStats[0]?.totalFiles || 0
        }
    };
};

// User Dashboard Service
const getUserDashboardService = async () => {
    let userId = "69b9024f05286a02d6a74ca9"
    // Run queries in parallel for performance
    const [projects, tasks, history, comments] = await Promise.all([
        Project.find({ assignedUsers: userId })
            .select("name description status startDate endDate"),

        Task.find({ assignedTo: userId })
            .select("title status priority dueDate projectId"),

        TaskHistory.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10), // latest 10 activities

        Comment.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("taskId", "title")
    ]);

    // Optional: Group tasks by status
    const groupedTasks = {
        todo: tasks.filter(task => task.status === "todo"),
        inProgress: tasks.filter(task => task.status === "in-progress"),
        done: tasks.filter(task => task.status === "done"),
    };

    return {
        success: true,
        data: {
            projects,
            tasks: groupedTasks,
            recentActivity: history,
            recentComments: comments,
        },
    };

};


module.exports = { getS_AdminDashboardService, getAdminDashboardService, getUserDashboardService };