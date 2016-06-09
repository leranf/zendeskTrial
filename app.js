(function() {

  return {
    events: {
      'app.activated':'showInfo'
    },

    showInfo: function() {
      this.switchTo('requester');
    }
  };

}());
