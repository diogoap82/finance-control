'use strict';

var app = angular.module('financeControl');

app.controller('incomesController', function($scope, $http, $modal, $locale, uiGridConstants, Utils, Incomes) {

    var rowTemplate = '<div ng-class="{\'red-font-color\':row.entity.isLatePayment == true }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';

 	$scope.gridOptions = {
        enableSorting: true,
		showColumnFooter: true,
        rowHeight: 23,
        rowTemplate: rowTemplate,
        columnDefs: [
          	{ name: 'Ações', type: 'string', width:'107', minWidth:'107', enableColumnResizing: false, enableSorting: false, enableColumnMenu: false, cellTemplate:
          		'<a class="btn btn-primary btn-xs" title="Editar" href="" ng-click="grid.appScope.openModal(row.entity._id, \'edit\')"><i class="fa fa-pencil fa-lg fa-fw"></i></a>' + '&#32' +
          		'<a class="btn btn-primary btn-xs" title="Excluir" href="" ng-click="grid.appScope.deleteConfirmation(row.entity._id)"><i class="fa fa-trash-o fa-lg fa-fw"></i></a>' + '&#32' +
          		'<a class="btn btn-primary btn-xs" title="Receber" ng-show="row.entity.status == \'Em aberto\'" href="" ng-click="grid.appScope.receiveIncomeConfirmation(row.entity._id)"><i class="fa fa-usd fa-lg fa-fw"></i></a>',
        		headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-left-align'
          	},
        	{ name: 'Vencimento', field: 'dueDate', type: 'date', width:'8%', enableColumnMenu: false,
          		cellFilter: 'date:"shortDate"', headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-center-align'
          	},
          	{
				name: 'Descrição', field: 'description', type: 'string', width:'22%', enableColumnMenu: false,
				aggregationType: uiGridConstants.aggregationTypes.count, aggregationHideLabel: true,
				footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue()}} registros</div>'
			},
          	{ name: 'Valor', field: 'amount', type: 'number',  width: '10%', enableColumnMenu: false,
          		cellFilter: 'number:2', headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-right-align',
				aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
				footerCellTemplate: '<div class="ui-grid-cell-contents ui-grid-cell-right-align" >{{col.getAggregationValue() | number:2 }}</div>'
          	},
          	{ name: 'Conta', field: '_accountNames', type: 'string', width:'15%', enableColumnMenu: false },
        	{ name: 'Categoria', field: '_categoryNames', type: 'string', width:'15%', enableColumnMenu: false },
        	{ name: 'Situação', field: 'status', type: 'string', width:'9%', enableColumnMenu: false,
        		headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-center-align'
        	},
        	{ name: 'Valor receb.', field: 'amountReceived', type: 'number', width:'10%', enableColumnMenu: false,
				cellFilter: 'number:2', headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-right-align',
				aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
				footerCellTemplate: '<div class="ui-grid-cell-contents ui-grid-cell-right-align" >{{col.getAggregationValue() | number:2 }}</div>'
        	}
        ]
    };

    $scope.gridOptions.onRegisterApi = function (gridApi) {
         $scope.gridApi = gridApi;
    }

  	$scope.openCalendarDialogBegin = function($event) {
    	$event.preventDefault();
    	$event.stopPropagation();
    	$scope.beginOpened = true;
  	};

  	$scope.openCalendarDialogEnd = function($event) {
    	$event.preventDefault();
    	$event.stopPropagation();
    	$scope.endOpened = true;
  	};

  	$scope.navigatePreviousMonth = function($event) {
		var date;

		if (isNaN(Date.parse($scope.incomeDueDateBegin))) {
			date = new Date();
		}
		else {
			date = $scope.incomeDueDateBegin;
		}

		var y = date.getFullYear(), m = date.getMonth();
		$scope.incomeDueDateBegin = new Date(y, m - 1, 1);
		$scope.incomeDueDateEnd = new Date(y, m, 0);

		$scope.getIncomes();
  	};

  	$scope.navigateActualMonth = function($event) {
		var date = new Date(), y = date.getFullYear(), m = date.getMonth();
		$scope.incomeDueDateBegin = new Date(y, m, 1);
		$scope.incomeDueDateEnd = new Date(y, m + 1, 0);

		$scope.getIncomes();
  	};

  	$scope.navigateNextMonth = function($event) {
		var date;

		if (isNaN(Date.parse($scope.incomeDueDateBegin))) {
			date = new Date();
		}
		else {
			date = $scope.incomeDueDateBegin;
		}

		var y = date.getFullYear(), m = date.getMonth();
		$scope.incomeDueDateBegin = new Date(y, m + 1, 1);
		$scope.incomeDueDateEnd = new Date(y, m + 2, 0);

		$scope.getIncomes();
  	};

	$scope.filter = function($event) {
		if ((isNaN(Date.parse($scope.incomeDueDateBegin)) == false) && (isNaN(Date.parse($scope.incomeDueDateEnd))) == false) {
			$scope.getIncomes();
		}
  	};

  	$scope.openModal = function (incomeId, action) {
    	var modalInstance = $modal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/incomesModal.html',
      		controller: incomesModalController,
      		size: 'lg',
      		resolve: {
		        incomeId: function () {
					return incomeId;
        		},
        		action: function () {
        			return action;
        		}
      		}
    	});

		modalInstance.result.then(function (income) {
	    	if (income._action == 'new') {
	    		$scope.createIncome(income);
	    	} else if (income._action == 'edit') {
	    		$scope.editIncome(income);
	    	}
		});
    };

    $scope.openGeneratorModal = function () {
    	var modalInstance = $modal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/generatorModal.html',
      		controller: generatorModalController,
      		size: 'lg',
      		resolve: {
		        type: function () {
					return 'Receita';
        		}
      		}
    	});

        modalInstance.result.then(function (id) {
			Utils.addSucess($scope, 'Receita(s) gerada(s) com sucesso!');
        	$scope.getIncomes();
        });
    };

    $scope.deleteConfirmation = function (IncomeId) {
    	var modalInstance = $modal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/confirmModal.html',
      		controller: confirmModalController,
      		size: 'sm',
      		resolve: {
		        data: function () {
					return IncomeId;
        		},
		        message: function () {
					return 'Confirma a exclusão da receita?';
        		}
      		}
    	});

		modalInstance.result.then(function (id) {
	    	$scope.deleteIncome(id);
		});
    };

    $scope.receiveIncomeConfirmation = function (IncomeId) {
    	var modalInstance = $modal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/confirmModal.html',
      		controller: confirmModalController,
      		size: 'sm',
      		resolve: {
		        data: function () {
					return IncomeId;
        		},
		        message: function () {
					return 'Confirma o recebimento da receita?';
        		}
      		}
    	});

		modalInstance.result.then(function (id) {
	    	$scope.receiveIncome(id);
		});
    };

	$scope.getDueDateFilter = function() {
		var dateBegin, dateEnd, y, m, d;

		dateBegin = $scope.incomeDueDateBegin;
		y = dateBegin.getFullYear(), m = dateBegin.getMonth(), d = dateBegin.getDate();
		dateBegin = new Date(y, m, d);

		dateEnd = $scope.incomeDueDateEnd;
		y = dateEnd.getFullYear(), m = dateEnd.getMonth(), d = dateEnd.getDate();
		dateEnd = new Date(y, m, d, 23, 59, 59, 999);

		return 'dueDateBegin=' + dateBegin + '&dueDateEnd=' + dateEnd;
	}

	$scope.getIncomes = function() {
		$scope.loading = true;

		var filter = $scope.getDueDateFilter();

		Incomes.get(filter)
			.success(function(data) {
				$scope.gridOptions.data = data;
				$scope.loading = false;
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.createIncome = function(income) {
		$scope.loading = true;

		Incomes.create(income)
			.success(function(data) {
                Utils.addSucess($scope, 'Receita adicionada com sucesso!');
				$scope.getIncomes();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.editIncome = function(income) {
		$scope.loading = true;

		Incomes.patch(income._id, income)
			.success(function(data) {
                Utils.addSucess($scope, 'Receita editada com sucesso!');
				$scope.getIncomes();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.deleteIncome = function(id) {
		$scope.loading = true;

		Incomes.delete(id)
			.success(function(data) {
                Utils.addSucess($scope, 'Receita excluída com sucesso!');
				$scope.getIncomes();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.receiveIncome = function(id) {
        $scope.loading = true;

		Incomes.receive(id)
			.success(function(data) {
                Utils.addSucess($scope, 'Receita recebida com sucesso!');
                $scope.getIncomes();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

	// initialization
    $scope.Utils = Utils;
    $scope.alerts = [];
	$scope.navigateActualMonth();
});