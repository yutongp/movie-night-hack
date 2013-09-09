
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var MovieSchema = new Schema({
  actors: { type: String, default: '', trim: true }
  , director: { type: String, default: '', trim: true }
  , genre: { type: String, default: '', trim: true }
  , plot: { type: String, default: '', trim: true }
  , poster: { type: String, default: '', trim: true }
  , rated: { type: String, default: '', trim: true }
  , released: { type: String, default: '', trim: true }
  , runtime: { type: String, default: '', trim: true }
  , title: { type: String, default: '', trim: true }
  , type: { type: String, default: '', trim: true }
  , writer: { type: String, default: '', trim: true }
  , year: { type: String, default: '', trim: true }
  , imdbID: { type: String, default: '', trim: true }
  , imdbRating: { type: Number, min: 0, max: 10 }
});

var UserSchema = new Schema({
  name: { type: String, default: '', trim: true }
  , firstName: { type: String, default: '', trim: true }
  , lastName: { type: String, default: '', trim: true }
  , fbID: { type: String, default: '', trim: true }
  , username: { type: String, default: '', trim: true }
  , profileImage: { type: String, default: '', trim: true }
  , likedMovies: [{ type: Schema.Types.ObjectId, ref: 'Movie'}]
  , joinedEvents: [{ type: Schema.Types.ObjectId, ref: 'Event'}]
});

var EventSchema = new Schema({
  users: [{ type: String, ref: 'User'}]
  , comRecoMovies: [{type: Schema.Types.ObjectId, ref: 'Movie'}]
  , movieVotes: {type: Schema.Types.Mixed}
  , location: { type: String, default: '', trim: true }
  , eventTime: { type: Date, default: Date.now }
  , createAt: { type: Date, default: Date.now }
  , host: {type: String, ref: 'User'}
});


mongoose.model('Movie', MovieSchema);
mongoose.model('User', UserSchema);
mongoose.model('Event', EventSchema);
