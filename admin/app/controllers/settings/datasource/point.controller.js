'use strict';

app.controller('PointController', function($scope, $uibModal, $translate, DataSourceService, PointService, toaster, SweetAlert) {

	$scope.getAllDataSources = function() {
		DataSourceService.getAllDataSources(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.datasources = response.data;
				if ($scope.datasources.length > 0) {
					$scope.currentDataSource = $scope.datasources[0].id;
					$scope.getPointsByDataSourceID($scope.currentDataSource);
				}
			} else {
				$scope.datasources = [];
			}
		});

	};

	$scope.getPointsByDataSourceID = function(id) {
		PointService.getPointsByDataSourceID(id, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.points = response.data;
			} else {
				$scope.points = [];
			}
		});

	};


	$scope.changeDataSource = function(item, model) {
		$scope.currentDataSource = model;
		$scope.getPointsByDataSourceID($scope.currentDataSource);
	};

	$scope.addPoint = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/datasource/point.model.html',
			controller: 'ModalAddPointCtrl',
			windowClass: "animated fadeIn",
		});
		modalInstance.result.then(function(point) {
			point.data_source_id = $scope.currentDataSource;
			if(point.ratio==""){
				point.ratio = undefined;
			}
			PointService.addPoint(point, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY",{template: $translate.instant( "SETTING.POINT")}),
						showCloseButton: true,
					});
					$scope.getPointsByDataSourceID($scope.currentDataSource);
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.FAILURE_TITLE"),
						body: "TOASTER.ERROR_ADD_BODY",
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
	};

	$scope.editPoint = function(point) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/datasource/point.model.html',
			controller: 'ModalEditPointCtrl',
			resolve: {
				params: function() {
					return {
						point: angular.copy(point)
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedPoint) {
			modifiedPoint.data_source_id = $scope.currentDataSource;
			if(modifiedPoint.ratio==""){
				modifiedPoint.ratio = undefined;
			}
			PointService.editPoint(modifiedPoint, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("SETTING.POINT")}),
						showCloseButton: true,
					});
					$scope.getPointsByDataSourceID($scope.currentDataSource);
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.FAILURE_TITLE"),
						body: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("SETTING.POINT")}),
						showCloseButton: true,
					});
				}
			});
		}, function() {
			//do nothing;
		});
	};

	$scope.deletePoint = function(point) {
		SweetAlert.swal({
				title: $translate.instant("SWEET.TITLE"),
				text: $translate.instant("SWEET.TEXT"),
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: $translate.instant("SWEET.CONFIRM_BUTTON_TEXT"),
				cancelButtonText: $translate.instant("SWEET.CANCEL_BUTTON_TEXT"),
				closeOnConfirm: true,
				closeOnCancel: true
			},
			function(isConfirm) {
				if (isConfirm) {
					PointService.deletePoint(point, function (response) {
						if (angular.isDefined(response.status) && response.status === 204) {
                            toaster.pop({
                                type: "success",
                                title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                                body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("SETTING.POINT")}),
                                showCloseButton: true,
                            });
							$scope.getPointsByDataSourceID($scope.currentDataSource);
						} else if (angular.isDefined(response.status) && response.status === 400) {
                            toaster.pop({
                                type: "error",
                                title: $translate.instant(response.data.title),
                                body: $translate.instant(response.data.description),
                                showCloseButton: true,
                            });
						} else {
                            toaster.pop({
                                type: "error",
                                title: $translate.instant("TOASTER.FAILURE_TITLE"),
                                body: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("SETTING.POINT")}),
                                showCloseButton: true,
                            });
						}
					});
				}
			});
	};



	$scope.getAllDataSources();
	$scope.$on("handleBroadcastDataSourceChanged", function(event) {
		$scope.getAllDataSources();
	});

});


app.controller('ModalAddPointCtrl', function($scope, $uibModalInstance) {

	$scope.operation = "SETTING.ADD_POINT";
	$scope.point = {};
	$scope.point.object_type = "ENERGY_VALUE";
	$scope.point.is_trend = true;
	$scope.point.is_virtual = false;
	$scope.ok = function() {
		$uibModalInstance.close($scope.point);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditPointCtrl', function($scope, $uibModalInstance, params) {
	$scope.operation = "SETTING.EDIT_POINT";
	$scope.point = params.point;

	$scope.ok = function() {
		$uibModalInstance.close($scope.point);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
