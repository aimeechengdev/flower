angular.module('flower', ['angularFileUpload'])
  .controller('FlowerController', function( $scope, $http, FileUploader) {
    $scope.uploader = new FileUploader({
            url: 'flower'
    });
    $scope.showConfirm = false;
    $scope.uploader.onSuccessItem = function(fileItem, response, status, headers) {
   //   console.log(response);
      $scope.flowerName = response;
      $scope.flowerList.push(response);
      $scope.showConfirm = true;
    };
    
    $scope.flowerList = [];
  //  $scope.flowerList.push({"name":"Rose"});
 
    $scope.imgShow = false; 
    $(":file").change(function () {
      if (this.files && this.files[0]) {
          var reader = new FileReader();
          reader.onload = imageIsLoaded;
          reader.readAsDataURL(this.files[0]);
      }
    });
    function imageIsLoaded(e) {
      $scope.imgShow = true;
      $('#myImg').attr('src', e.target.result);
      $scope.chosenFile = $scope.uploader.queue[$scope.uploader.queue.length-1];
      $scope.chosenFile.upload();
    };
    
    $scope.confirm = function(){
       $http.get("/confirm")
    .success(function(response) {
      $scope.showConfirm = false;
      
    });
    }
  });