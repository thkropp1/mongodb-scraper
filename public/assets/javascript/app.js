$(document).ready(function() {

  // Nav Bar Mobile Slider
  $(".button-collapse").sideNav();


  // Click Listener to SAVE an article
  $('.save-article-button').on('click', function() {

      // Get _id of comment to be added
      var articleId = $(this).data("id");

      // URL root (so it works in the localhost for Heroku)
      var baseURL = window.location.origin;

      // Get Form Data by Id
      var frmName = "form-save-" + articleId;
      var frm = $('#' + frmName);

      // AJAX Call to update saved boolean to true
      $.ajax({
          url: baseURL + '/save/article/' + articleId,
          type: 'POST',
          data: frm.serialize()
          })
        .done(function(data) {
          console.log(data);
        });
      });


      // Click Listener to DELETE a saved article
      $('.delete-saved-button').on('click', function() {

          // Get _id of comment to be added
          var articleId = $(this).data("id");

          // URL root (so it works in the localhost for Heroku)
          var baseURL = window.location.origin;

          // Get Form Data by Id
          var frmName = "form-del-" + articleId;
          var frm = $('#' + frmName);

          // AJAX Call to update saved boolean to false
          $.ajax({
              url: baseURL + '/delete/savedArticle/' + articleId,
              type: 'POST',
              data: frm.serialize()
              })
            .done(function(data) {
              console.log(data);
            });
          });


// Click Listener to ADD a comment
$('.add-comment-button').on('click', function() {

  // Get _id of comment to be added
  var articleId = $(this).data("id");

  // URL root (so it works in the localhost for Heroku)
  var baseURL = window.location.origin;

  // Get Form Data by Id
  var frmName = "form-add-" + articleId;
  var frm = $('#' + frmName);


  // AJAX Call to add the comment
  $.ajax({
      url: baseURL + '/add/comment/' + articleId,
      type: 'POST',
      data: frm.serialize()
    })
    .done(function() {
      // Clear the Comment box
      $(".author_name").each(function(index, element) {
        $(element).val("");
      });
      $(".comment_box").each(function(index, element) {
        $(element).val("");
      });
      // Refresh the Window after the call is done
      location.reload();
    });

  // Prevent Default
  return false;

});


// Click Listener to DELETE a comment
$('.delete-comment-button').on('click', function() {

  // Get _id of comment to be deleted
  var commentId = $(this).data("id");

  // URL root (so it works in the localhost for Heroku)
  var baseURL = window.location.origin;

  // AJAX Call to delete Comment
  $.ajax({
      url: baseURL + '/remove/comment/' + commentId,
      type: 'POST',
    })
    .done(function() {
      // Refresh the Window after the call is done
      location.reload();
    });

  // Prevent Default
  return false;

});

});
