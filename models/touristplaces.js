const mongoose=require('mongoose');
const { schema } = require('./review');
const Review = require('./review');
const Schema=mongoose.Schema;

const ImageSchema=new Schema({
    url:String,
    filename:String
});

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_250');
});

const DestinationSchema=new Schema({
    title:String,
    image:[ImageSchema],
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    price:Number,
    description:String,
    location:String,
    date:{
        type:Date,
        default:new Date()
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
});

DestinationSchema.post('findOneAndDelete',async function(doc) {
    if(doc){
        await Review.deleteMany({
            _id:{
                $in:doc.reviews
            }
        })
    }  
})

module.exports=mongoose.model('Destination',DestinationSchema);