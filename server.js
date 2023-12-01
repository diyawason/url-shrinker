const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');
const app = express();

mongoose.connect('mongodb://localhost/urlShortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

// GET route to display all short URLs
app.get('/', async (req, res) => {
  const shortUrls = await ShortUrl.find();
  res.render('index', { shortUrls: shortUrls });
});

// POST route to create a new short URL
app.post('/shortUrls', async (req, res) => {
  try {
    const { fullUrl } = req.body;
    if (!fullUrl) {
      return res.status(400).send("Full URL is required");
    }
    const shortUrl = await ShortUrl.create({ full: fullUrl });
    res.redirect('/');
  } catch (error) {
    console.error(error); 
    res.status(500).send("Internal Server Error");
  }
});

app.post('/shortUrls/:id', async (req, res) => {
  if (req.query.delete) {
    try {
      const deletedUrl = await ShortUrl.findByIdAndDelete(req.params.id);
      if (!deletedUrl) {
        return res.status(404).send("URL not found");
      }
      res.json({ success: true, message: "URL deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
})

// GET route to redirect to the full URL
app.get('/:shortUrl', async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
  if (shortUrl == null) return res.sendStatus(404);

  shortUrl.clicks++;
  shortUrl.save();

  res.redirect(shortUrl.full);
});

//<-- DELETE route to delete a short URL by ID -->
app.delete('/shortUrls/:id', async (req, res) => {
  try {
    const deletedUrl = await ShortUrl.findByIdAndDelete(req.params.id);
    if (!deletedUrl) {
      return res.status(404).send("URL not found");
    }
    res.json({ success: true, message: "URL deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(process.env.PORT || 5000);
