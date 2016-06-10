(function() {

  return {
    events: {
      'app.activated':'getDateToday',
      'click .prev': 'prevMonth',
      'click .next': 'nextMonth',
      'click .nasaImage': 'changeSelected'
    },

    requests : {
      nasaGetRequest: function(date) {
        var url = 'https://api.nasa.gov/planetary/apod?api_key=8tKXFJvk4bzxmNizdRyj62p8ouqTEIo4LCoJO7FP&date=' + date;
        return {
          url: url,
          type:'GET',
          dataType: 'json'
        };
      }
    },

    selectedPhoto: {
      photo: null
    },

    calendarPhotos: {},

    currentDate: {
      year: null,
      month: null,
      day: null
    },

    daysInMonth: {
      1: 31,
      2: 28,
      3: 31,
      4: 30,
      5: 31,
      6: 30,
      7: 31,
      8: 31,
      9: 30,
      10: 31,
      11: 30,
      12: 31
    },

    monthToString: {
      1: 'January',
      2: 'February',
      3: 'March',
      4: 'April',
      5: 'May',
      6: 'June',
      7: 'July',
      8: 'August',
      9: 'September',
      10: 'October',
      11: 'November',
      12: 'December'
    },

    getDateToday: function() {
      var date = new Date();
      date = this.formatDate(date);
      this.currentDate = date;
      var today = date.year + '-' + date.month + '-' + date.day;
      var showError = this.showError.bind(this);
      var getPhotosOfMonth = this.getPhotosOfMonth.bind(this);
      this.ajax('nasaGetRequest', today)
        .done(function(data) {
          this.selectedPhoto.photo = data.hdurl;
          getPhotosOfMonth(date);
        })
        .fail(function(err) {
          showError();
        });
    },

    formatDate: function(date) {
      // YYYY-MM-DD
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      };
    },

    getPhotosOfMonth: function(date) {
      this.currentDate.year = date.year;
      this.currentDate.month = date.month;
      var photosOfMonth = {};
      var count = 0;
      var daysInMonth = this.daysInMonth[date.month];
      var currYear = String(date.year);
      var currMonth = String(date.month).length < 2 ? '0' + String(date.month) : String(date.month);
      var getPhotoForDate = this.ajax.bind(this);
      var showInfo = this.showInfo.bind(this);
      var organizeInCalendar = this.organizeInCalendar.bind(this);

      for (var i = 1; i <= daysInMonth; i++) {
        (function(i) { 
          var currDay = String(i).length < 2 ? '0' + String(i) : String(i);
          var currDate = currYear + '-' + currMonth + '-' + currDay;
          getPhotoForDate('nasaGetRequest', currDate)
            .done(function(data) {
              photosOfMonth[i] = data.hdurl;
              count++;
              if (count === daysInMonth) {
                organizeInCalendar(photosOfMonth);
              }
            })
            .fail(function(err) {
              photosOfMonth[i] = undefined;
              count++;
              if (count === daysInMonth) {
                organizeInCalendar(photosOfMonth);
              }
            });
        })(i);
      }

    },

    organizeInCalendar: function(photos) {
      var str = String(this.currentDate.month) + ' 01 ' + String(this.currentDate.year);
      var firstDay = new Date(str).getDay();
      var calendar = [
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined]
      ];

      var col = firstDay;
      var day = 1;
      while (col < 7) {
        calendar[0][col++] = photos[day++];
        this.calendarPhotos['calendar0' + (col-1)] = calendar[0][col-1];
      }
      for (var i = 1; i < 5; i++) {
        for (var j = 0; j < 7; j++) {
          calendar[i][j] = photos[day++];
          this.calendarPhotos['calendar' + i + j] = calendar[i][j];
        }
      }

      this.showInfo();

    },

    prevMonth: function() {
      console.log('PREVIOUS MONTH INVOKED!')
      var year = this.currentDate.year;
      var month = this.currentDate.month;
      if (month > 1) {
        this.currentDate.month = month - 1;
      } else {
        this.currentDate.month = 12;
        this.currentDate.year = year - 1;
      }

      this.getPhotosOfMonth({year: this.currentDate.year, month: this.currentDate.month});

    },

    nextMonth: function() {
      console.log('NEXT MONTH INVOKED!')
      var year = this.currentDate.year;
      var month = this.currentDate.month;
      if (month < 12) {
        this.currentDate.month = month + 1;
      } else {
        this.currentDate.month = 1;
        this.currentDate.year = year + 1;
      }
      
      this.getPhotosOfMonth({year: this.currentDate.year, month: this.currentDate.month});

    },

    changeSelected: function(event) {
      this.selectedPhoto.photo = event.currentTarget.src;
      this.showInfo();
    },

    showInfo: function() {
      var data = this.calendarPhotos;
      data.selected = this.selectedPhoto.photo;
      data.month = this.monthToString[this.currentDate.month];
      data.year = this.currentDate.year;
      this.switchTo('requester', data);
    },

    showError: function() {
      this.switchTo('error');
    }
  };

}());
