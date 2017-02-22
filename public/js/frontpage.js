//script for frontpage

var channel_list;
var git_info;
var frontpage = true;
var socket;
var rotation_timeout;

/*
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}
*/

var Frontpage = {

  blob_list: [],

  winter: (new Date()).getMonth() >= 10 ? true : false,

  times_rotated: 0,

  frontpage_function: function(msg)
  {
    $("#channels").empty();
    frontpage = true;

    Helper.log("-----------");
    Helper.log("Frontpage fetch");
    Helper.log(msg);
    Helper.log("------------");

    Frontpage.populate_channels(msg.channels);

    Frontpage.set_viewers(msg.viewers);
  },

  populate_channels: function(lists)
  {
      var num = 0;
      var pinned;
      if(lists[0].pinned == 1){
        pinned = lists.shift();
      }
      lists.sort(Frontpage.sortFunction);
      if(pinned !== undefined){
        lists.unshift(pinned);
      }

      if(!Helper.mobilecheck())
        Frontpage.add_backdrop(lists, 0);

      pre_card = $(channel_list);

      Helper.log("------------");
      Helper.log(pre_card);
      Helper.log("-------------");

      for(var x in lists)
      {

          var chan = lists[x].channel;
          if(num<12)
          {
            var id = lists[x].id;
            var viewers = lists[x].viewers;
            var description = lists[x].description;
            var img = "background-image:url('https://img.youtube.com/vi/"+id+"/hqdefault.jpg');";
            if(lists[x].thumbnail){
              img = "background-image:url('" + lists[x].thumbnail + "');";
            }

            var song_count = lists[x].count;

            //$("#channels").append(channel_list);

            var card = pre_card.clone();
            if(lists[x].pinned == 1)
            {
              card.find(".pin").attr("style", "display:block;");
              card.find(".card").attr("title", "Pinned!");
            }
            else
            {
              card.find(".pin").attr("style", "display:none;");
              card.find(".card").attr("title", "");
            }
            card.find(".chan-name").text(chan);
            card.find(".chan-name").attr("title", chan);
            card.find(".chan-views").text(viewers);
            card.find(".chan-songs").text(song_count);
            card.find(".chan-bg").attr("style", img);
            card.find(".chan-link").attr("href", chan);

            if(description != "" && !Helper.mobilecheck()){
              card.find(".card-title").text(chan);
              card.find(".description_text").text(description);
              description = "";
            } else {
              card.find(".card-reveal").remove();
              card.find(".card").removeClass("sticky-action")
            }

            $("#channels").append(card.html());

            //$("#channels").append(card);
          }
          num++;
          //if(num>19)break;
      }
      var options_list = lists.slice();

      options_list = options_list.sort(Frontpage.sortFunction_active);
      var data = {};
      //num = 0;
      for(var x in options_list){
        //if(options_list[x].count > 5 && Math.floor((new Date).getTime()/1000) - options_list[x].accessed < 604800){
          /*var chan = options_list[x].channel;
          output+="<option value='"+chan+"'> ";*/
          data[options_list[x].channel] = null;
        //}
      }

      var to_autocomplete = "input.desktop-search";
      if(Helper.mobilecheck()) to_autocomplete = "input.mobile-search";

      $(to_autocomplete).autocomplete({
        data: data,
        limit: 5, // The max amount of results that can be shown at once. Default: Infinity.
      });

      //$(".autocomplete").off('keydown.autocomplete');

      document.getElementById("preloader").style.display = "none";
      //Materialize.fadeInImage('#channels');
      $("#channels").fadeIn(800);
      $("#searchFrontpage").focus();
  },

  sortFunction: function(a, b) {
    var o1 = a.viewers;
    var o2 = b.viewers;

    var p1 = a.count;
    var p2 = b.count;

    if (o1 < o2) return 1;
    if (o1 > o2) return -1;
    if (p1 < p2) return 1;
    if (p1 > p2) return -1;
    return 0;
  },

  sortFunction_active: function(a, b){
    var o1 = a.accessed;
    var o2 = b.accessed;

    var p1 = a.count;
    var p2 = b.count;

    if (o1 < o2) return 1;
    if (o1 > o2) return -1;
    if (p1 < p2) return 1;
    if (p1 > p2) return -1;
    return 0;
  },

  getCookie: function(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) === 0) return c.substring(name.length,c.length);
    }
    return "";
  },

  add_backdrop: function(list, i) {
    if(i >= list.length || i >= 20) i = 0;

    var id = list[i].id;

    if(Frontpage.blob_list[i] !== undefined){
      //$(".room-namer").css("opacity", 0);
      setTimeout(function(){
        if(frontpage){
          $("#mega-background").css("background", "url(data:image/png;base64,"+Frontpage.blob_list[i]+")");
          $("#mega-background").css("background-size" , "200%");
          $("#mega-background").css("opacity", 1);
          $("#searchFrontpage").attr("placeholder", list[i].channel);
          //$(".room-namer").css("opacity", 1);
        }
      },500);
    } else {
      var img = new Image();
      img.src = "/public/images/thumbnails/"+id+".jpg";

      img.onerror = function(){ // Failed to load
          $.ajax({
            type: "POST",
            data: {id:id},
            url: "/public/php/imageblob.php",
            success: function(data){
                Frontpage.blob_list.push(data);
               //data will contain the vote count echoed by the controller i.e.
                //$(".room-namer").css("opacity", 0);
                setTimeout(function(){
                  $("#mega-background").css("background", "url(data:image/png;base64,"+data+")");
                  $("#mega-background").css("background-size" , "200%");
                  $("#mega-background").css("opacity", 1);
                  $("#searchFrontpage").attr("placeholder", list[i].channel);
                  //$(".room-namer").css("opacity", 1);
                },500);
              //then append the result where ever you want like
              //$("span#votes_number").html(data); //data will be containing the vote count which you have echoed from the controller

              }
          });
      };
      img.onload = function(){ // Loaded successfully
          $("#mega-background").css("background", "url("+img.src+")");
          $("#mega-background").css("background-size" , "200%");
          $("#mega-background").css("opacity", 1);
          $("#searchFrontpage").attr("placeholder", list[i].channel);
      };

    }
    rotation_timeout = setTimeout(function(){
      if(Frontpage.times_rotated == 50 && frontpage){
        Frontpage.times_rotated = 0;
        i = 0;
        socket.emit("frontpage_lists");
      }else if(frontpage){
        Frontpage.times_rotated += 1;
        Frontpage.add_backdrop(list, i+1);
      }
    },6000);

  },

  start_snowfall: function(){
    setTimeout(function(){
      var x = Math.floor((Math.random() * window.innerWidth) + 1);
      var snow = document.createElement("div");
      var parent = document.getElementsByClassName("mega")[0];

      snow.className = "snow";
      //snow.attr("left", x);
      snow.style.left = x+"px";
      snow.style.top = "0px";
      parent.appendChild(snow);
      Frontpage.fall_snow(snow);
      Frontpage.start_snowfall();
    }, 800);
  },

  fall_snow: function(corn){
    corn.style.top = (parseInt(corn.style.top.replace("px", ""))+2)+"px";
    if(parseInt(corn.style.top.replace("px", "")) < document.getElementById("mega-background").offsetHeight-2.5){
      setTimeout(function(){
        Frontpage.fall_snow(corn);
      },50);
    }else{
      corn.remove();
    }
  },

  set_viewers: function(viewers){
    //if(viewers > 0){
      //var to_add = viewers > 1 ? "listeners" : "listener";
      $("#frontpage-viewer-counter").html("<i class='material-icons frontpage-viewers'>visibility</i>" + viewers);
    //}
  },

  to_channel: function(new_channel, popstate){

    $("#channel-load").css("display", "block");
    window.scrollTo(0, 0);
    frontpage = false;
    clearTimeout(rotation_timeout);
    if(Helper.mobilecheck()){
      Helper.log("removing all listeners");
      socket.removeAllListeners();
    }
    $("body").css("background-color", "#2d2d2d");
    $.ajax({
      url: new_channel + "/public/php/index.php",

      success: function(e){

        if(Player.player !== ""){
          //Player.player.destroy();
          socket.emit("change_channel", {channel: chan.toLowerCase()});
        }
        $("#frontpage_player").empty();
        if(Helper.mobilecheck()) {
          Helper.log("disconnecting");
          socket.disconnect();
        }

        if(!popstate){
          window.history.pushState("to the channel!", "Title", "/" + new_channel);
          if(prev_chan_list == "") prev_chan_list = new_channel;
          if(prev_chan_player == "") prev_chan_player = new_channel;
          window.chan = new_channel;
        }

        var response = $("<div>" + e + "</div>");

        $(".mega").remove();
        $(".mobile-search").remove();
        $("main").attr("class", "container center-align main");
        $("body").attr("id", "channelpage");
        //$("header").html($($(e)[63]).html());
        $("header").html($(response.find("header")).html());
        if($("#alreadychannel").length === 0 || Helper.mobilecheck() || Player.player === undefined){
          $("main").html($(response.find("main")).html());
        } else {
          $("#main-row").append($(response.find("#playlist").wrap("<div>").parent().html()));
          $("#video-container").append($(response.find("#main_components").wrap("<div>").parent().html()));
          $("#main-row").append("<div id='playbar'></div>");
          $("#player").removeClass("player_bottom");
          $("#main-row").removeClass("frontpage_modified_heights");
          $("#main_section_frontpage").remove();
          $("#closePlayer").remove();
          $("#player_bottom_overlay").remove();
        }
        $("#search").attr("placeholder", "Find song on YouTube...");
        $(".page-footer").addClass("padding-bottom-novideo");
        from_frontpage = true;
        if($("#alreadychannel").length == 1){
          init();
        }else{
          fromFront = true;
          init();
        }
        if($("#alreadyfp").length === 0) $("head").append("<div id='alreadyfp'></div>");

      }
    });
  }
};

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function share_link_modifier_frontpage(){
  $("#facebook-code-link").attr("href", "https://www.facebook.com/sharer/sharer.php?u=https://zoff.no/");
  $("#facebook-code-link").attr("onclick", "window.open('https://www.facebook.com/sharer/sharer.php?u=https://zoff.no/', 'Share Zöff','width=600,height=300'); return false;");
  $("#twitter-code-link").attr("href", "https://twitter.com/intent/tweet?url=https://zoff.no/&amp;text=Check%20out%20Zöff!&amp;via=zoffmusic");
  $("#twitter-code-link").attr("onclick", "window.open('https://twitter.com/intent/tweet?url=https://zoff.no/&amp;text=Check%20out%20Zöff!&amp;via=zoffmusic','Share Playlist','width=600,height=300'); return false;");
  $("#qr-code-link").attr("href", "//chart.googleapis.com/chart?chs=500x500&cht=qr&chl=https://zoff.no/&choe=UTF-8&chld=L%7C1");
  $("#qr-code-image-link").attr("src", "//chart.googleapis.com/chart?chs=150x150&cht=qr&chl=https://zoff.no/&choe=UTF-8&chld=L%7C1");
}

function initfp(){

    var date = new Date();
    Frontpage.blob_list = [];
    if(date.getMonth() == 3 && date.getDate() == 1){
      $(".mega").css("-webkit-transform", "rotate(180deg)");
      $(".mega").css("-moz-transform", "rotate(180deg)");
      //Materialize.toast('<p id="aprilfools">We suck at pranks..<a class="waves-effect waves-light btn light-green" style="pointer-events:none;">Agreed</a></p>', 100000);
    }


    window.onpopstate = function(e){
      var url_split = window.location.href.split("/");

      if(url_split[3] !== "" && url_split[3].substring(0,1) != "#"){
        Frontpage.to_channel(url_split[3], true);
      }
    };

    channel_list = $("#channel-list-container").html();

    share_link_modifier_frontpage();

    if(window.location.hostname == "zoff.no") add = "https://zoff.no";
    else add = window.location.hostname;
    if(socket === undefined || Helper.mobilecheck()) socket = io.connect(''+add+':8080', connection_options);
    if($("#alreadyfp").length === 0 || Helper.mobilecheck() || !socket._callbacks.$playlists){
      setup_playlist_listener();
    }

    $("#about").modal();
    $("#help").modal();
    $("#contact").modal();

    Helper.log("----");
    Helper.log("Sending frontpage_lists");
    Helper.log("Socket", socket);
    Helper.log("-----");

    Crypt.init();
    if(Crypt.get_offline()){
      change_offline(true, offline);
    } else {
      $("#offline-mode").tooltip({
        delay: 5,
        position: "bottom",
        tooltip: "Enable private mode"
      });
    }

    socket.emit('frontpage_lists');

    $("#channel-load").css("display", "none");
    //Materialize.toast("<a href='/remote' style='color:white;'>Try out our new feature, remote!</a>", 8000)
    if(window.location.hash == "#donation")
    {
      window.location.hash = "#";
      $('#donation').modal('open');
    }
    //window.channel_list = channel_list;

    if(!localStorage.ok_cookie){
      before_toast();
      Materialize.toast("We're using cookies to enhance your experience!  <a class='waves-effect waves-light btn light-green' href='#' id='cookieok' style='cursor:pointer;pointer-events:all;'> ok</a>", 10000);
    }

    var pad = 0;
    document.getElementById("zicon").addEventListener("click", function(){
        pad+=10;
        document.getElementById("zicon").style.paddingLeft = pad+"%";
        if(pad >= 100)
            window.location.href = 'http://etys.no';
    });

    if(!Helper.mobilecheck() && Frontpage.winter) {
      $(".mega").prepend('<div id="snow"></div>');
      //Frontpage.start_snowfall();
    }

    if(Helper.mobilecheck()){
      $('input#searchFrontpage').characterCounter();
    }

    window['__onGCastApiAvailable'] = function(loaded, errorInfo) {
      if (loaded) {
        chromecastReady = true;
      } else {
      }
    }
}
