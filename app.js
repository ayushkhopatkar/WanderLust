const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Connected To DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main(params) {
  await mongoose.connect(MONGO_URL);
}

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
  res.send("Hi, Im root");
});

//Index Route
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

//new route
app.get("/listings/new", async (req, res) => {
  res.render("listings/new.ejs");
});

//show route
// app.get("/listings/:id", async (req, res) => {
//   let { id } = req.params;
//   const listing = await Listing.findById(id);
//   res.render("listings/show.ejs", { listing });
// });

const isValidObjectId = mongoose.Types.ObjectId.isValid;

app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).send("Invalid listing ID.");
  }

  try {
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).send("Listing not found.");
    }
    res.render("listings/show.ejs", { listing });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

//create route
app.post("/listings", async (req, res) => {
  const newlisting = new Listing(req.body.listing);
  await newlisting.save();
  res.redirect("/listings");
});

//Edit Route
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

//update route
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
});

//DELETE route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});

// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By The Beach",
//     price: 1200,
//     location: "Calungate,Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("succesfull testing");
// });

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
