const ApiError = require("./ApiError");

const isOwner = (currentUserId, resourceOwner) => {
    if (!currentUserId || !resourceOwner) return false;

    // Handle populated objects (e.g., { _id: ObjectId })
    const ownerId = resourceOwner._id ? resourceOwner._id : resourceOwner;

    // If ObjectId → use .equals()
    if (typeof currentUserId.equals === "function") {
        return currentUserId.equals(ownerId);
    }

    // Fallback to string comparison
    return String(currentUserId) === String(ownerId);
};

const assertOwner = (currentUserId, resourceOwner, message = "Unauthorized: Not owner") => {
    const owner = resourceOwner._id ? resourceOwner._id : resourceOwner;

    const isSame = typeof currentUserId.equals === "function"
        ? currentUserId.equals(owner)
        : String(currentUserId) === String(owner);

    if (!isSame) {
        throw new ApiError(403, message);
    }
};

module.exports = {
    isOwner,
    assertOwner
};