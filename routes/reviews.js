const express=require('express');
const router=express.Router({mergeParams:true});
const {validateReview,isLoggedIn,isReviewOwner}=require('../middleware')
const Destination=require('../models/touristplaces');
const Review=require('../models/review');
const catchAsync=require('../utils/catchAsync');
const review=require('../controllers/reviews');

router.post('/',isLoggedIn,validateReview,catchAsync(review.createReview));

router.delete('/:reviewId',isReviewOwner,isLoggedIn,catchAsync(review.deleteReview));

module.exports=router;