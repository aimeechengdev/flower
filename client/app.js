angular.module('flower', ['angularFileUpload'])
  .controller('FlowerController', function( $scope, $http, FileUploader) {
    $scope.uploader = new FileUploader({
            url: 'flower'
        });
            $scope.uploader.onSuccessItem = function(fileItem, response, status, headers) {
            console.info('onSuccessItem', fileItem, response, status, headers);
             $scope.flowerList.push(response);
        };
    $scope.flowerList = [];
    $scope.flowerList.push({"name":"Rose"});
    $scope.uploadImg = function(){
      var tmp = $scope.uploader;
    };
    
    $scope.imgShow = false; 
    $(":file").change(function () {
      if (this.files && this.files[0]) {
          var reader = new FileReader();
          reader.onload = imageIsLoaded;
          reader.readAsDataURL(this.files[0]);
        //   $http.post("/", this.files[0]).success(function(data, status) {
        //     $scope.hello = data;
        // }).error(function(data, status) {
        //     $scope.hello = data;
        // })
      //    $scope.chosenFile = $scope.uploader.queue[$scope.uploader.queue.length-1];
      }
    });
    function imageIsLoaded(e) {
      $scope.imgShow = true;
      $('#myImg').attr('src', e.target.result);
      $scope.chosenFile = $scope.uploader.queue[$scope.uploader.queue.length-1];
      $scope.chosenFile.upload();
  
     
       
    };
  });