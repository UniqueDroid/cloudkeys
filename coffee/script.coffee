class CloudKeys
  constructor: () ->
    @entities = []
    @version = ""
    @password = '' #todo replace with user password
    $('#pw').focus().keyup (evt) =>
      `var that = this`
      if evt.keyCode is 13
        @password = $(that).val()
        @fetchData()
        $('#newEntityLink').click =>
          @showForm()

        $('.hide').removeClass('hide')
        $('#passwordRequest').addClass('hide')

        $('#search').keyup =>
          `var that = this`
          @showItems(@getItems($(that).val()))
          return
        $('#search').focus()
        $(window).keyup (evt) =>
          if evt.altKey is true and evt.keyCode is 66
            $('#items li.active .username').focus().select()
          if evt.altKey is true and evt.keyCode is 79 # workaround to copy password very fast
            $('#items li.active .passwordtoggle em').click()
            $('#items li.active .password').focus().select()
          if evt.altKey is true and evt.keyCode is 80
            $('#items li.active .password').focus().select()
          if evt.altKey is true and evt.keyCode is 85
            $('#items li.active .url').focus().select()

  import: (xml) ->
    parsedXML = $.parseXML(xml)

    for group in $(parsedXML).find('group')
      tag = $(group).find('>title').text()
      for entry in $(group).find('entry')
        e = $(entry)
        entity = {}
        entity['title'] = e.find('title').text()
        entity['username'] = e.find('username').text()
        entity['password'] = e.find('password').text()
        entity['url'] = e.find('url').text()
        entity['comment'] = e.find('comment').text()
        entity['tags'] = tag
        @entities.push(entity)
    @updateData =>
      $('#importLink').click()

  updateData: (callback) ->
    encrypted = @encrypt(JSON.stringify(@entities))
    hash = CryptoJS.SHA1(encrypted).toString()

    $.post 'ajax', {'version': @version, 'checksum': hash, 'data': encrypted}, (result) =>
      if typeof result.error isnt "undefined"
        alert "An error occured, please reload and try it again"
      else
        if typeof callback isnt "undefined"
          callback()
        @updateInformation(result)
    , "json"

  fetchData: () ->
    $.get 'ajax', (data) =>
      @updateInformation(data)
    , "json"

  updateInformation: (data) ->
    @version = data.version

    if data.data == ""
      @entities = []
    else
      try
        @entities = $.parseJSON(@decrypt(data.data))
      catch e
        window.location.reload()

    @showItems(@getItems($('#search').val()))

  encrypt: (value) ->
    return CryptoJS.AES.encrypt(value, @password).toString()

  decrypt: (value) ->
    return CryptoJS.AES.decrypt(value, @password).toString(CryptoJS.enc.Utf8)

  getClippyCode: (value) ->
    code = '<span class="clippy"><object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="14" height="14" class="clippy">'
    code += '<param name="movie" value="js/clippy.swf"/><param name="allowScriptAccess" value="always" /><param name="quality" value="high" />'
    code += "<param name=\"scale\" value=\"noscale\" /><param name=\"FlashVars\" value=\"text=#{encodeURIComponent(value)}\"><param name=\"bgcolor\" value=\"#e5e3e9\">"
    code += "<embed src=\"js/clippy.swf\" width=\"14\" height=\"14\" name=\"clippy\" quality=\"high\" allowScriptAccess=\"always\" type=\"application/x-shockwave-flash\" pluginspage=\"http://www.macromedia.com/go/getflashplayer\" FlashVars=\"text=#{encodeURIComponent(value)}\" bgcolor=\"#e5e3e9\" /></object></span>"
    return code

  showItems: (items) ->
    items.sort(@sortItems)
    $('#items li').remove()
    itemContainer = $('#items')
    $('#resultdescription span').text(items.length)
    for item in items
      c = $("<li data-num=\"#{ item.num }\">#{ item.title } <span>#{ item.username }</span></li>")
      ul = $("<ul></ul>")
      password = ""
      for char, i of item.password
        password += "*"
      ul.append("<li><label>Username:</label><input type=\"text\" class=\"username\" value=\"#{ item.username }\">#{ @getClippyCode(item.username) }<br></li>")
      ul.append("<li class=\"passwordtoggle\"><label>Password:</label><input type=\"text\" class=\"password\" value=\"#{ password }\" data-toggle=\"#{ item.password }\"><em> (toggle visibility)</em></span>#{ @getClippyCode(item.password) }<br></li>")
      ul.append("<li><label>URL:</label><input type=\"text\" class=\"url\" value=\"#{ item.url }\">#{ @getClippyCode(item.url) }<br></li>")
      lines_match = item.comment.match(/\n/g)
      if lines_match isnt null
        counter = lines_match.length
      if counter < 2
        counter = 2
      ul.append("<li><label>Comment:</label><textarea class=\"comment\" rows=\"#{ counter + 2 }\">#{ item.comment }</textarea>#{ @getClippyCode(item.comment) }<br></li>")
      ul.append("<li><label>Tags:</label><input type=\"text\" class=\"tags\" value=\"#{ item.tags }\">#{ @getClippyCode(item.tags) }<br></li>")
      ul.append("<li class=\"last\"><button class=\"btn btn-primary\">Edit</button><br></li>")
      ul.find('.btn-primary').click () =>
        `var t = this`
        num = $(t).parent().parent().parent().data('num')
        if typeof num isnt "undefined" and typeof num isnt null
          @showForm(num)

      ul.find('.passwordtoggle em').click () =>
        `var t = this`
        elem = $(t).parent().find('.password')
        original = elem.data('toggle')
        elem.data('toggle', elem.val())
        elem.val(original)
      c.append(ul)

      c.click =>
        `var that = this`
        elem = $(that)
        if elem.hasClass('active') is false
          $('#items li.active').removeClass('active').find('ul').slideUp()
          elem.addClass('active')
          elem.find('ul').slideDown()

      c.find('input').focus().select()

      itemContainer.append(c)
    return

  getItems: (search) ->
    result = []
    re = new RegExp(search, 'i')
    for item, i in @entities
      if item.title.search(re) != -1 or item.username.search(re) != -1 or item.tags.search(re) != -1
        item.num = i
        result.push(item)

    return result
  
  sortItems: (a, b) ->
    aTitle = a.title.toLowerCase()
    bTitle = b.title.toLowerCase()
    `((aTitle < bTitle) ? -1 : ((aTitle > bTitle) ? 1 : 0))`

  showForm: (num) ->
    $('#editDialog input').val('')
    $('#editDialog textarea').val('')
    $('#editDialog .hide').removeClass('hide')
    fields = ['title', 'username', 'password', 'url', 'comment', 'tags']

    if typeof num isnt "undefined" and typeof @entities[num] isnt "undefined"
      $('#editDialog input[name="num"]').val(num)
      for elem in fields
        $("#editDialog ##{elem}").val(@entities[num][elem])
      $("#editDialog input#repeat_password").val(@entities[num]['password'])
    else
      $('#editDialog button.btn-danger').addClass('hide')

    $('#editDialog').modal({})
    $('#editDialog .btn-danger').unbind('click').click =>
      confirmation = confirm('Are you sure?')
      if confirmation is true
        num = $('#editDialog input[name="num"]').val()
        if typeof num isnt "undefined" and typeof num isnt null and num != ""
          @entities.splice(num, 1)

          @updateData =>
            $('#formClose').click()

    $('#editDialog .btn-primary').unbind('click').click =>
      if @validateForm()
        num = $('#editDialog input[name="num"]').val()
        entity = {}
        for field in fields
          entity[field] = $("##{field}").val()
        if typeof num != "undefined" and num != ""
          @entities[num] = entity
        else
          @entities.push(entity)

        @updateData =>
          $('#formClose').click()
      return

  validateForm: () ->
    $('#editDialog .has-error').removeClass('has-error')
    success = true
    if $('#title').val() == ""
      $('#title').parent().addClass('has-error')
      success = false

    if $('#password').val() isnt "" && $('#repeat_password').val() isnt $('#password').val()
      $('#password, #repeat_password').parent().addClass('has-error')
      success = false

    return success

window.CloudKeys = new CloudKeys()
$('#importLink').click =>
  $('#importContainer').toggle(500)

$('#importContainer button').click =>
  window.CloudKeys.import($('#import').val())
  #$('#import').val('')
