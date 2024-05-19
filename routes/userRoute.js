const express = require("express");
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
  changeLoggedUserPasswordValidator,
} = require("../utils/validators/userValidator");
const authServices = require("../services/authServices");
const {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUser,
  activeLoggedUser,
  uploadUserImages,
  resizeImage,
  toggleLockMyProfile,
  getUserProfile,
} = require("../services/userService");

const router = express.Router();

router.get("/getMe", authServices.protect, getLoggedUserData, getUser);
router.delete("/deleteMe", authServices.protect, deleteLoggedUser);
router.put("/activeMe", authServices.protect, activeLoggedUser);
router.put("/lockProfile", authServices.protect, toggleLockMyProfile);
router.put("/:id/profile", authServices.protect, getUserProfile);
router.put(
  "/changeMyPassword",
  authServices.protect,
  changeLoggedUserPasswordValidator,
  updateLoggedUserPassword
);
router.put(
  "/changeMyData",
  authServices.protect,
  uploadUserImages,
  resizeImage,
  updateLoggedUserValidator,
  updateLoggedUserData
);
router.put(
  "/changePassword/:id",
  authServices.protect,
  authServices.allowedTo("admin"),
  changeUserPasswordValidator,
  changeUserPassword
);

router
  .route("/")
  .get(authServices.protect, authServices.allowedTo("admin"), getUsers)
  .post(
    authServices.protect,
    authServices.allowedTo("admin"),
    uploadUserImages,
    resizeImage,
    createUserValidator,
    createUser
  );
router
  .route("/:id")
  .get(
    authServices.protect,
    authServices.allowedTo("admin"),
    getUserValidator,
    getUser
  )
  .put(
    authServices.protect,
    authServices.allowedTo("admin"),
    uploadUserImages,
    resizeImage,
    updateUserValidator,
    updateUser
  )
  .delete(
    authServices.protect,
    authServices.allowedTo("admin"),
    deleteUserValidator,
    deleteUser
  );

module.exports = router;
