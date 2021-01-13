const express=require('express');
const router=express.Router();
const catchAsync=require('../utils/catchAsync');
const Destination=require('../models/touristplaces');
const {isLoggedIn,validateDestination,isOwner}=require('../middleware');
const destination=require('../controllers/destination');
const multer=require('multer');
const {storage}=require('../cloudinary/index')
const upload=multer({storage})

router.route('/')
    .get(catchAsync(destination.index))
    .post(isLoggedIn,upload.array('image'),validateDestination,catchAsync(destination.createDestination))


router.get('/new',isLoggedIn,destination.newForm)

router.route('/:id')
    .get(catchAsync(destination.showDestination))
    .put(isLoggedIn,isOwner,upload.array('image'),validateDestination,catchAsync(destination.updateDestination))
    .delete(isLoggedIn,isOwner,catchAsync(destination.deleteDestination))

router.get('/:id/edit',isLoggedIn,isOwner,catchAsync(destination.renderEditForm))

module.exports=router;
