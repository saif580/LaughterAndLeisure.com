const {destinationSchema}=require('./schemas.js');
const ExpressError=require('./utils/ExpressError');
const Destination=require('./models/touristplaces');
const Review=require('./models/review');
const {reviewSchema}=require('./schemas');
module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo=req.originalUrl;
        req.flash('error','you must signed in');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateDestination=(req,res,next)=>{
    const {error}=destinationSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',');
        throw new ExpressError(400,msg)
    } else {
        next()
    }
}

module.exports.isOwner=async(req,res,next)=>{
    const{id}=req.params;
    const destination=await Destination.findById(id);
    if(!destination.owner.equals(req.user._id)){
        req.flash('error','You do not have permission to Edit!');
        return res.redirect(`/destination/${id}`);
    } else {
        next();
    }
}

module.exports.isReviewOwner=async(req,res,next)=>{
    const{id,reviewId}=req.params;
    const review=await Review.findById(reviewId);
    if(!review.owner.equals(req.user._id)){
        req.flash('error','You do not have permission to Edit!');
        return res.redirect(`/destination/${id}`);
    } else {
        next();
    }
}

module.exports.validateReview=(req,res,next)=>{
    const {error}=reviewSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',');
        throw new expressError(400,msg)
    } else {
        next()
    }
}