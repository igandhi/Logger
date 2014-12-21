Topics = new Mongo.Collection("topics");

if (Meteor.isClient) {
  Meteor.subscribe("topics");

  Template.body.helpers({
    topics: function() {
      return Topics.find({}, {sort: {createdAt: -1}});
    }
  });

  Template.body.events({
    "submit .new-topic": function(event) {
      var text = event.target.text.value;

      Meteor.call("addTopic", text);
      event.target.text.value = "";

      return false;
    }
  });

  Template.topic.events({
    "click .reduce": function() {
      Meteor.call("reduceTime", this._id);
    },
    "click .increase": function() {
      Meteor.call("addTime", this._id);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

Meteor.methods({
  addTopic: function(text) {
    if(!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Topics.insert({
      text: text,
      timeSpent: 0,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  reduceTime: function(topicId) {
    var topic = Topics.findOne(topicId);
    if(topic.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    if (topic.timeSpent > 0) {
      Topics.update(topicId, { $set: { timeSpent: topic.timeSpent - 15 } });
    } else {
      throw new Meteor.Error("Cannot reduce time");
    }
  },
  addTime: function(topicId) {
    var topic = Topics.findOne(topicId);
    if(topic.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Topics.update(topicId, { $set: { timeSpent: topic.timeSpent + 15 } });
  }
});

if (Meteor.isServer) {
  Meteor.publish("topics", function() {
    return Topics.find({owner: this.userId});
  });
}
