const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { cloudinary } = require("../cloudConfig.js"); // Import cloudinary
const { required } = require("joi");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: { 
        filename: String,
        url: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    category: {
        type: String,
        enum: [
          'trending', 'rooms', 'iconic-cities', 'mountains', 'castles', 
          'amazing-pools', 'camping', 'farms', 'arctic', 'domes', 'boats'
        ],
        default: 'trending'
      },
      
    
});

listingSchema.post("findOneAndDelete", async function (listing) {
    if (listing) {
        // Delete associated reviews
        await Review.deleteMany({
            _id: {
                $in: listing.reviews,
            },
        });

        // Delete image from Cloudinary
        if (listing.image && listing.image.filename) {
            try {
                await cloudinary.uploader.destroy(listing.image.filename);
                console.log(`Deleted image ${listing.image.filename} from Cloudinary`);
            } catch (err) {
                console.error("Error deleting image from Cloudinary:", err);
            }
        }
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;