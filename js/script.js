// Generated by CoffeeScript 1.7.1
(function() {
  var CloudKeys;

  CloudKeys = (function() {
    function CloudKeys() {
      this.entities = [];
      this.version = "";
      this.password = '';
      $('#pw').focus().keyup((function(_this) {
        return function(evt) {
          var that = this;
          if (evt.keyCode === 13) {
            _this.password = $(that).val();
            $('#loader').removeClass('hide');
            _this.fetchData();
            $('#newEntityLink').click(function() {
              return _this.showForm();
            });
            $('#passwordRequest').addClass('hide');
            $('#search').keyup(function() {
              var that = this;
              _this.limitItems(_this.getItems($(that).val()));
            });
            $('#search').focus();
            return $(window).keyup(function(evt) {
              if (evt.altKey === true && evt.keyCode === 66) {
                if (typeof window.copyToClipboard === "function") {
                  copyToClipboard($('#items li.active .username').val());
                } else {
                  $('#items li.active .username').focus().select();
                }
              }
              if (evt.altKey === true && evt.keyCode === 79) {
                if (typeof window.copyToClipboard === "function") {
                  copyToClipboard($('#items li.active .password').data('toggle'));
                } else {
                  $('#items li.active .passwordtoggle em').click();
                  $('#items li.active .password').focus().select();
                }
              }
              if (evt.altKey === true && evt.keyCode === 80) {
                if (typeof window.copyToClipboard === "function") {
                  copyToClipboard($('#items li.active .password').data('toggle'));
                } else {
                  $('#items li.active .password').focus().select();
                }
              }
              if (evt.altKey === true && evt.keyCode === 85) {
                if (typeof window.copyToClipboard === "function") {
                  return copyToClipboard($('#items li.active .url').val());
                } else {
                  return $('#items li.active .url').focus().select();
                }
              }
            });
          }
        };
      })(this));
    }

    CloudKeys.prototype["import"] = function(xml) {
      var e, entity, entry, group, parsedXML, tag, _i, _j, _len, _len1, _ref, _ref1;
      parsedXML = $.parseXML(xml);
      _ref = $(parsedXML).find('group');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        group = _ref[_i];
        tag = $(group).find('>title').text();
        _ref1 = $(group).find('entry');
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          entry = _ref1[_j];
          e = $(entry);
          entity = {};
          entity['title'] = e.find('title').text();
          entity['username'] = e.find('username').text();
          entity['password'] = e.find('password').text();
          entity['url'] = e.find('url').text();
          entity['comment'] = e.find('comment').text();
          entity['tags'] = tag;
          this.entities.push(entity);
        }
      }
      return this.updateData((function(_this) {
        return function() {
          $('#import').val('');
          return $('#importLink').click();
        };
      })(this));
    };

    CloudKeys.prototype.updateData = function(callback) {
      var encrypted, hash;
      encrypted = this.encrypt(JSON.stringify(this.entities));
      hash = CryptoJS.SHA1(encrypted).toString();
      return $.post('ajax', {
        'version': this.version,
        'checksum': hash,
        'data': encrypted
      }, (function(_this) {
        return function(result) {
          if (typeof result.error !== "undefined") {
            return alert("An error occured, please reload and try it again");
          } else {
            if (typeof callback !== "undefined") {
              callback();
            }
            return _this.updateInformation(result);
          }
        };
      })(this), "json");
    };

    CloudKeys.prototype.fetchData = function() {
      return $.get('ajax', (function(_this) {
        return function(data) {
          return _this.updateInformation(data);
        };
      })(this), "json");
    };

    CloudKeys.prototype.updateInformation = function(data) {
      var e;
      this.version = data.version;
      if (data.data === "") {
        this.entities = [];
      } else {
        try {
          this.entities = $.parseJSON(this.decrypt(data.data));
        } catch (_error) {
          e = _error;
          window.location.reload();
        }
      }
      this.entities.sort(this.sortItems);
      this.showItems(this.getItems(''));
      return this.limitItems(this.getItems($('#search').val()));
    };

    CloudKeys.prototype.encrypt = function(value) {
      return CryptoJS.AES.encrypt(value, this.password).toString();
    };

    CloudKeys.prototype.decrypt = function(value) {
      return CryptoJS.AES.decrypt(value, this.password).toString(CryptoJS.enc.Utf8);
    };

    CloudKeys.prototype.getClippyCode = function(value) {
      var code;
      code = '<span class="clippy"><object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="14" height="14" class="clippy">';
      code += '<param name="movie" value="../../js/clippy.swf"/><param name="allowScriptAccess" value="always" /><param name="quality" value="high" />';
      code += "<param name=\"scale\" value=\"noscale\" /><param name=\"FlashVars\" value=\"text=" + (encodeURIComponent(value)) + "\"><param name=\"bgcolor\" value=\"#e5e3e9\">";
      code += "<embed src=\"../../js/clippy.swf\" width=\"14\" height=\"14\" name=\"clippy\" quality=\"high\" allowScriptAccess=\"always\" type=\"application/x-shockwave-flash\" pluginspage=\"http://www.macromedia.com/go/getflashplayer\" FlashVars=\"text=" + (encodeURIComponent(value)) + "\" bgcolor=\"#e5e3e9\" /></object></span>";
      return code;
    };

    CloudKeys.prototype.limitItems = function(items) {
      var current;
      $('#resultdescription span').text(items.length);
      current = 0;
      $('#items>li').each((function(_this) {
        return function(k, v) {
          var item;
          item = $(v);
          item.removeClass('odd');
          if ($.inArray(item.data('num'), items) === -1) {
            item.addClass('hide');
          } else {
            if (item.hasClass('hide')) {
              item.removeClass('hide');
            }
            if (current % 2 === 0) {
              item.addClass('odd');
            }
            current = current + 1;
          }
        };
      })(this));
    };

    CloudKeys.prototype.showItems = function(items) {
      var additionalClass, c, char, counter, i, item, itemContainer, lines_match, password, ul, _i, _len, _ref;
      $('#items li').remove();
      itemContainer = $('#items');
      $('#resultdescription span').text(items.length);
      for (i = _i = 0, _len = items.length; _i < _len; i = ++_i) {
        item = items[i];
        additionalClass = "";
        if (i % 2 === 0) {
          additionalClass = "odd";
        }
        item = this.entities[item];
        c = $("<li data-num=\"" + item.num + "\" class=\"" + additionalClass + "\">" + item.title + " <span>" + item.username + "</span></li>");
        ul = $("<ul></ul>");
        password = "";
        _ref = item.password;
        for (char in _ref) {
          i = _ref[char];
          password += "*";
        }
        ul.append("<li><label>Username:</label><input type=\"text\" class=\"username\" value=\"" + item.username + "\">" + (this.getClippyCode(item.username)) + "<br></li>");
        ul.append("<li class=\"passwordtoggle\"><label>Password:</label><input type=\"text\" class=\"password\" value=\"" + password + "\" data-toggle=\"" + item.password + "\"><em> (toggle visibility)</em></span>" + (this.getClippyCode(item.password)) + "<br></li>");
        ul.append("<li><label>URL:</label><input type=\"text\" class=\"url\" value=\"" + item.url + "\">" + (this.getClippyCode(item.url)) + "<br></li>");
        lines_match = item.comment.match(/\n/g);
        if (lines_match !== null) {
          counter = lines_match.length;
        }
        if (counter < 2) {
          counter = 2;
        }
        ul.append("<li><label>Comment:</label><textarea class=\"comment\" rows=\"" + (counter + 2) + "\">" + item.comment + "</textarea>" + (this.getClippyCode(item.comment)) + "<br></li>");
        ul.append("<li><label>Tags:</label><input type=\"text\" class=\"tags\" value=\"" + item.tags + "\">" + (this.getClippyCode(item.tags)) + "<br></li>");
        ul.append("<li class=\"last\"><button class=\"btn btn-primary\">Edit</button><br></li>");
        ul.find('.btn-primary').click((function(_this) {
          return function() {
            var t = this;
            var num;
            num = $(t).parent().parent().parent().data('num');
            if (typeof num !== "undefined" && typeof num !== null) {
              return _this.showForm(num);
            }
          };
        })(this));
        ul.find('.passwordtoggle em').click((function(_this) {
          return function() {
            var t = this;
            var elem, original;
            elem = $(t).parent().find('.password');
            original = elem.data('toggle');
            elem.data('toggle', elem.val());
            return elem.val(original);
          };
        })(this));
        c.append(ul);
        c.click((function(_this) {
          return function() {
            var that = this;
            var elem;
            elem = $(that);
            if (elem.hasClass('active') === false) {
              $('#items li.active').removeClass('active').find('ul').slideUp();
              elem.addClass('active');
              return elem.find('ul').slideDown();
            }
          };
        })(this));
        c.find('input').focus().select();
        itemContainer.append(c);
      }
      $('.hide').removeClass('hide');
      $('#loader').addClass('hide');
      $('#passwordRequest').addClass('hide');
      $('#search').focus();
    };

    CloudKeys.prototype.getItems = function(search) {
      var i, item, result, _i, _len, _ref;
      result = [];
      search = search.toLowerCase();
      _ref = this.entities;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        item = _ref[i];
        if (item.title.toLowerCase().indexOf(search) !== -1 || item.username.toLowerCase().indexOf(search) !== -1 || item.tags.toLowerCase().indexOf(search) !== -1) {
          item.num = i;
          result.push(i);
        }
      }
      return result;
    };

    CloudKeys.prototype.sortItems = function(a, b) {
      var aTitle, bTitle;
      aTitle = a.title.toLowerCase();
      bTitle = b.title.toLowerCase();
      return ((aTitle < bTitle) ? -1 : ((aTitle > bTitle) ? 1 : 0));
    };

    CloudKeys.prototype.showForm = function(num) {
      var elem, fields, _i, _len;
      $('#editDialog input').val('');
      $('#editDialog textarea').val('');
      $('#editDialog .hide').removeClass('hide');
      fields = ['title', 'username', 'password', 'url', 'comment', 'tags'];
      if (typeof num !== "undefined" && typeof this.entities[num] !== "undefined") {
        $('#editDialog input[name="num"]').val(num);
        for (_i = 0, _len = fields.length; _i < _len; _i++) {
          elem = fields[_i];
          $("#editDialog #" + elem).val(this.entities[num][elem]);
        }
        $("#editDialog input#repeat_password").val(this.entities[num]['password']);
      } else {
        $('#editDialog button.btn-danger').addClass('hide');
      }
      $('#editDialog').modal({});
      $('#editDialog .btn-danger').unbind('click').click((function(_this) {
        return function() {
          var confirmation;
          confirmation = confirm('Are you sure?');
          if (confirmation === true) {
            num = $('#editDialog input[name="num"]').val();
            if (typeof num !== "undefined" && typeof num !== null && num !== "") {
              _this.entities.splice(num, 1);
              return _this.updateData(function() {
                return $('#formClose').click();
              });
            }
          }
        };
      })(this));
      return $('#editDialog .btn-primary').unbind('click').click((function(_this) {
        return function() {
          var entity, field, _j, _len1;
          if (_this.validateForm()) {
            num = $('#editDialog input[name="num"]').val();
            entity = {};
            for (_j = 0, _len1 = fields.length; _j < _len1; _j++) {
              field = fields[_j];
              entity[field] = $("#" + field).val();
            }
            if (typeof num !== "undefined" && num !== "") {
              _this.entities[num] = entity;
            } else {
              _this.entities.push(entity);
            }
            _this.updateData(function() {
              return $('#formClose').click();
            });
          }
        };
      })(this));
    };

    CloudKeys.prototype.validateForm = function() {
      var success;
      $('#editDialog .has-error').removeClass('has-error');
      success = true;
      if ($('#title').val() === "") {
        $('#title').parent().addClass('has-error');
        success = false;
      }
      if ($('#password').val() !== "" && $('#repeat_password').val() !== $('#password').val()) {
        $('#password, #repeat_password').parent().addClass('has-error');
        success = false;
      }
      return success;
    };

    return CloudKeys;

  })();

  window.CloudKeys = new CloudKeys();

  $('#importLink').click((function(_this) {
    return function() {
      return $('#importContainer').toggle(500);
    };
  })(this));

  $('#importContainer button').click((function(_this) {
    return function() {
      return window.CloudKeys["import"]($('#import').val());
    };
  })(this));

}).call(this);
