const Destination=require('../models/touristplaces');
const Review=require('../models/review');

module.exports.createReview=async(req,res)=>{
    const destination=await Destination.findById(req.params.id);
    const review=new Review(req.body.review);
    review.owner=req.user._id;
    destination.reviews.push(review);
    await review.save();
    await destination.save();
    req.flash('success','Added New Review');
    res.redirect(`/destination/${destination._id}`);
};

module.exports.deleteReview=async(req,res)=>{
    const {id,reviewId}=req.params;
    await Destination.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully Deleted Review');
    res.redirect(`/destination/${id}`);
};