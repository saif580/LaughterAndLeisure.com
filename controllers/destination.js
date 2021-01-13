const Destination=require('../models/touristplaces');
const {cloudinary}=require('../cloudinary/index')
const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken=process.env.MAP_BOX;
const geocoder=mbxGeocoding({accessToken:mapBoxToken});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports.index=async(req,res)=>{
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        const destinations=await Destination.find({title:regex});
        if(destinations.length<1){
            req.flash('error','No Places Match That!');
            let destinations=await Destination.find();
            res.render('destination/index.ejs',{destinations})
        } else {
            res.render('destination/index.ejs',{destinations});
        }
    } else {
        const destinations=await Destination.find();
        res.render('destination/index.ejs',{destinations});
    }
};

module.exports.newForm=(req,res)=>{
    res.render('destination/new.ejs')
};

module.exports.createDestination=async(req,res,next)=>{
    const geoData=await geocoder.forwardGeocode({
        query:req.body.destination.location,
        limit:1
    }).send()
    const destination=new Destination(req.body.destination);
    destination.geometry=geoData.body.features[0].geometry;
    destination.image=req.files.map(f=>({url:f.path,filename:f.filename}));
    destination.owner=req.user._id;
    await destination.save();
    console.log(destination);
    req.flash('success','Added New Place');
    res.redirect(`/destination/${destination._id}`)
};

module.exports.showDestination=async(req,res)=>{
    const {id}=req.params;
    const destination=await Destination.findById(id).populate({
        path:'reviews',
        populate: {
            path:'owner'
        }
    }).populate('owner');
    if(!destination){
        req.flash('error','Cannot find the place!');
        return res.redirect('/destination');
    }
    res.render('destination/show.ejs',{destination});
};

module.exports.renderEditForm=async(req,res)=>{
    const {id}=req.params;
    const destination=await Destination.findById(id);
    if(!destination){
        req.flash('error','Cannot find the place!');
        return res.redirect('/destination');
    }
    res.render('destination/edit.ejs',{destination})
};

module.exports.updateDestination=async(req,res)=>{
    const {id}=req.params;
    console.log(req.body);
    const destination=await Destination.findByIdAndUpdate(id,{...req.body.destination});
    const img=req.files.map(f=>({url:f.path,filename:f.filename}));
    destination.image.push(...img);
    await destination.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await destination.updateOne({$pull:{image:{filename:{$in:req.body.deleteImages}}}})
    }
    req.flash('success','Successfully Updated');
    res.redirect(`/destination/${destination._id}`)
};

module.exports.deleteDestination=async(req,res)=>{
    const {id}=req.params;
    await Destination.findByIdAndDelete(id);
    req.flash('success','Successfully Deleted');
    res.redirect('/destination');
};