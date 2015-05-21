angular.module('flower', ['angularFileUpload'])
  .controller('FlowerController', function( $scope, $http, FileUploader) {
    $scope.uploader = new FileUploader();
    $scope.uploadImg = function(){
var tmp = $scope.uploader;
    }
    
       $(":file").change(function () {
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onload = imageIsLoaded;
            reader.readAsDataURL(this.files[0]);
        }
    });
    
    function imageIsLoaded(e) {
    $('#myImg').attr('src', e.target.result);
};
  });