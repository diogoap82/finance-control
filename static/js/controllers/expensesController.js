'use strict';

var app = angular.module('financeControl');

function getCellClasses(row, cellClass) {
    var styles = cellClass;
    if (row.entity.isLatePayment == true) {
        styles = styles + ' red-font-color';
    }
    return styles;
}

app.controller('expensesController', function($scope, $http, $uibModal, $locale, uiGridConstants, Utils, Expenses) {

 	$scope.columns = [
        {
            name: 'Vencimento', field: 'dueDate', type: 'date', width: Utils.getSizeRes('9%', '15%', '21%'), enableColumnMenu: false,
            cellFilter: 'date:"shortDate"', headerCellClass: 'ui-grid-cell-center-align',
            cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                return getCellClasses(row, 'ui-grid-cell-center-align')
            }
        },
        {
            name: 'Descrição', field: 'description', type: 'string', width: Utils.getSizeRes('26%', '27%', '41%'), enableColumnMenu: false,
            aggregationType: uiGridConstants.aggregationTypes.count, aggregationHideLabel: true,
            footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue()}} registros</div>',
            cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                return getCellClasses(row, '')
            }
        },
        { name: 'Valor', field: 'amount', type: 'number',  width: Utils.getSizeRes('9%', '12%', '20%'), enableColumnMenu: false,
            cellFilter: 'number:2', headerCellClass: 'ui-grid-cell-right-align',
            aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
            footerCellTemplate: '<div class="ui-grid-cell-contents ui-grid-cell-right-align" >{{col.getAggregationValue() | number:2 }}</div>',
            cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                return getCellClasses(row, 'ui-grid-cell-right-align')
            }
        },
        {
            name: 'Conta', field: '_accountNames', type: 'string', width: Utils.getSizeRes('16%', '17%', '0%'), visible: Utils.getVisibilityRes(true, true, false), enableColumnMenu: false,
            cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                return getCellClasses(row, '')
            }
        },
        {
            name: 'Categoria', field: '_categoryNames', type: 'string', width: Utils.getSizeRes('16%', '17%', '0%'), visible: Utils.getVisibilityRes(true, true, false), enableColumnMenu: false,
            cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                return getCellClasses(row, '')
            }
        },
        {
            name: 'Situação', field: 'status', type: 'string', width: Utils.getSizeRes('10%', '12%', '18%'), enableColumnMenu: false,
            headerCellClass: 'ui-grid-cell-center-align',
            cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                return getCellClasses(row, 'ui-grid-cell-center-align')
            }
        },
        {
            name: 'Valor pago', field: 'amountPaid', type: 'number', width: Utils.getSizeRes('9%', '0%', '0%'), visible: Utils.getVisibilityRes(true, false, false), enableColumnMenu: false,
            cellFilter: 'number:2', headerCellClass: 'ui-grid-cell-right-align',
            aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
            footerCellTemplate: '<div class="ui-grid-cell-contents ui-grid-cell-right-align" >{{col.getAggregationValue() | number:2 }}</div>',
            cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                return getCellClasses(row, 'ui-grid-cell-right-align')
            }
        },
        {
            name: 'Ag.', field: 'scheduledPayment', type: 'string', width: Utils.getSizeRes('5%', '0%', '0%'), visible: Utils.getVisibilityRes(true, false, false), enableColumnMenu: false,
            cellTemplate: '<input type="checkbox" onclick="return false" ng-model="row.entity.scheduledPayment">',
            headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-center-align'
        }
    ];

    $scope.gridOptions = {
        enableRowSelection: true,
    	enableRowHeaderSelection: false,
    	multiSelect: false,
    	enableSelectAll: false,
        enableColumnResizing: true,
        enableSorting: true,
		showColumnFooter: true,
        rowHeight: Utils.getGridRowHeight(),
        columnDefs: $scope.columns,
        onRegisterApi: function(gridApi) {
        	$scope.gridApi = gridApi;
        	gridApi.selection.on.rowSelectionChanged($scope,function(row){
        		$scope.selectedRow = row;
        	});
        }
    };

  	$scope.openCalendarDialogBegin = function($event) {
    	$scope.beginOpened = true;
  	};

  	$scope.openCalendarDialogEnd = function($event) {
    	$scope.endOpened = true;
  	};

  	$scope.navigatePreviousMonth = function($event) {
		var date;

		if (isNaN(Date.parse($scope.expenseDueDateBegin))) {
			date = new Date();
		}
		else {
			date = $scope.expenseDueDateBegin;
		}

		var y = date.getFullYear(), m = date.getMonth();
		$scope.expenseDueDateBegin = new Date(y, m - 1, 1);
		$scope.expenseDueDateEnd = new Date(y, m, 0);

		$scope.getExpenses();
  	};

  	$scope.navigateActualMonth = function($event) {
		var date = new Date(), y = date.getFullYear(), m = date.getMonth();
		$scope.expenseDueDateBegin = new Date(y, m, 1);
		$scope.expenseDueDateEnd = new Date(y, m + 1, 0);

		$scope.getExpenses();
  	};

  	$scope.navigateNextMonth = function($event) {
		var date;

		if (isNaN(Date.parse($scope.expenseDueDateBegin))) {
			date = new Date();
		}
		else {
			date = $scope.expenseDueDateBegin;
		}

		var y = date.getFullYear(), m = date.getMonth();
		$scope.expenseDueDateBegin = new Date(y, m + 1, 1);
		$scope.expenseDueDateEnd = new Date(y, m + 2, 0);

		$scope.getExpenses();
  	};

	$scope.filter = function($event) {
		if ((isNaN(Date.parse($scope.expenseDueDateBegin)) == false) && (isNaN(Date.parse($scope.expenseDueDateEnd))) == false) {
			$scope.getExpenses();
		}
  	};

  	$scope.openModal = function (expenseId, action) {
    	var modalInstance = $uibModal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/expensesModal.html',
      		controller: expensesModalController,
      		size: 'lg',
      		resolve: {
		        expenseId: function () {
					return expenseId;
        		},
        		action: function () {
        			return action;
        		}
      		}
    	});

		modalInstance.result.then(function (expense) {
	    	if ((expense._action == 'new') || (expense._action == 'clone')) {
	    		$scope.createExpense(expense);
	    	} else if (expense._action == 'edit') {
	    		$scope.editExpense(expense);
	    	}
		});
    };

    $scope.openGeneratorModal = function () {
    	var modalInstance = $uibModal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/generatorModal.html',
      		controller: generatorModalController,
      		size: 'lg',
      		resolve: {
		        type: function () {
					return 'Despesa';
        		}
      		}
    	});

        modalInstance.result.then(function (id) {
			Utils.addSucess($scope, 'Despesa(s) gerada(s) com sucesso!');
            $scope.getExpenses();
		});
    };

    $scope.deleteConfirmation = function (ExpenseId) {
    	var modalInstance = $uibModal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/confirmModal.html',
      		controller: confirmModalController,
      		size: 'sm',
      		resolve: {
		        data: function () {
					return ExpenseId;
        		},
		        message: function () {
					return 'Confirma a exclusão da despesa?';
        		}
      		}
    	});

		modalInstance.result.then(function (id) {
	    	$scope.deleteExpense(id);
		});
    };

    $scope.payExpenseConfirmation = function (ExpenseId) {
    	var modalInstance = $uibModal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/confirmModal.html',
      		controller: confirmModalController,
      		size: 'sm',
      		resolve: {
		        data: function () {
					return ExpenseId;
        		},
		        message: function () {
					return 'Confirma o pagamento da despesa?';
        		}
      		}
    	});

		modalInstance.result.then(function (id) {
	    	$scope.payExpense(id);
		});
    };

	$scope.getDueDateFilter = function() {
		var dateBegin, dateEnd, y, m, d;

		dateBegin = $scope.expenseDueDateBegin;
		y = dateBegin.getFullYear(), m = dateBegin.getMonth(), d = dateBegin.getDate();
		dateBegin = new Date(y, m, d);

		dateEnd = $scope.expenseDueDateEnd;
		y = dateEnd.getFullYear(), m = dateEnd.getMonth(), d = dateEnd.getDate();
		dateEnd = new Date(y, m, d, 23, 59, 59, 999);

		return 'dueDateBegin=' + dateBegin + '&dueDateEnd=' + dateEnd;
	}

	$scope.getExpenses = function() {
		$scope.loading = true;

		var filter = $scope.getDueDateFilter();

		Expenses.get(filter)
			.success(function(data) {
				$scope.gridOptions.data = data;
                $scope.selectedRow = null;
				$scope.loading = false;
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.createExpense = function(expense) {
		$scope.loading = true;

		Expenses.create(expense)
			.success(function(data) {
				Utils.addSucess($scope, 'Despesa adicionada com sucesso!');
                $scope.getExpenses();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.editExpense = function(expense) {
		$scope.loading = true;

		Expenses.patch(expense._id, expense)
			.success(function(data) {
                Utils.addSucess($scope, 'Despesa editada com sucesso!');
				$scope.getExpenses();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.deleteExpense = function(id) {
		$scope.loading = true;

		Expenses.delete(id)
			.success(function(data) {
                Utils.addSucess($scope, 'Despesa excluída com sucesso!');
				$scope.getExpenses();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.payExpense = function(id) {
        $scope.loading = true;

		Expenses.pay(id)
			.success(function(data) {
                Utils.addSucess($scope, 'Despesa paga com sucesso!');
                $scope.getExpenses();
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
