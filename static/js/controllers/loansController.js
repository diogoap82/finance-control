'use strict';

var app = angular.module('financeControl');

app.controller('loansController', function ($scope, $http, $uibModal, $locale, uiGridConstants, Utils, Loans) {

	$scope.columns = [
		{
			name: 'Descrição', field: 'description', type: 'string', width: Utils.getSizeRes('28%', '32%', '42%'), enableColumnMenu: false,
			aggregationType: uiGridConstants.aggregationTypes.count, aggregationHideLabel: true,
			footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue()}} registros</div>'
		},
		{
			name: 'Data', field: 'transactionDate', type: 'date', width: Utils.getSizeRes('9%', '10%', '0%'), visible: Utils.getVisibilityRes(true, true, false), enableColumnMenu: false,
			cellFilter: 'date:"shortDate"', headerCellClass: 'ui-grid-cell-center-align', cellClass: 'ui-grid-cell-center-align'
		},
		{
			name: 'Vencimento', field: 'dueDate', type: 'date', width: Utils.getSizeRes('9%', '0%', '0%'), visible: Utils.getVisibilityRes(true, false, false), enableColumnMenu: false,
			cellFilter: 'date:"shortDate"', headerCellClass: 'ui-grid-cell-center-align', cellClass: 'ui-grid-cell-center-align'
		},
		{
			name: 'Moeda', field: '_currency.currencyCode', type: 'string', width: Utils.getSizeRes('6%', '8%', '10%'), visible: Utils.getVisibilityRes(true, true, true), enableColumnMenu: false,
			headerCellClass: 'ui-grid-cell-center-align', cellClass: 'ui-grid-cell-center-align'
		},
		{
			name: 'Valor', field: 'amount', type: 'number', width: Utils.getSizeRes('10%', '11%', '16%'), enableColumnMenu: false,
			cellFilter: 'number:2', headerCellClass: 'ui-grid-cell-right-align', cellClass: 'ui-grid-cell-right-align',
			aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
			footerCellTemplate: '<div class="ui-grid-cell-contents ui-grid-cell-right-align" >{{col.getAggregationValue() | number:2 }}</div>'
		},
		{
			name: 'Conta', field: '_account.name', type: 'string', width: Utils.getSizeRes('18%', '17%', '0%'), visible: Utils.getVisibilityRes(true, true, false), enableColumnMenu: false
		},
		{
			name: 'Tipo', field: 'type', type: 'string', width: Utils.getSizeRes('10%', '11%', '16%'), enableColumnMenu: false,
			headerCellClass: 'ui-grid-cell-center-align', cellClass: 'ui-grid-cell-center-align'
		},
		{
			name: 'Situação', field: 'status', type: 'string', width: Utils.getSizeRes('10%', '11%', '16%'), enableColumnMenu: false,
			headerCellClass: 'ui-grid-cell-center-align', cellClass: 'ui-grid-cell-center-align'
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
		onRegisterApi: function (gridApi) {
			$scope.gridApi = gridApi;
			gridApi.selection.on.rowSelectionChanged($scope, function (row) {
				$scope.selectedRow = row;
			});
			gridApi.cellNav.on.navigate($scope, function (newRowCol, oldRowCol) {
				$scope.gridApi.selection.selectRow(newRowCol.row.entity);
			});
		}
	};

	$scope.getFilter = function () {
		if ($scope.listPaidLoans == false) {
			return 'status=Em aberto';
		}
		return undefined;
	}

	$scope.openModal = function (loanId, action) {
		var modalInstance = $uibModal.open({
			animation: $scope.animationsEnabled,
			templateUrl: 'html/loansModal.html',
			controller: loansModalController,
			resolve: {
				loanId: function () {
					return loanId;
				},
				action: function () {
					return action;
				}
			}
		});

		modalInstance.result.then(function (loan) {
			if ((loan._action == 'new') || (loan._action == 'clone')) {
				$scope.createLoan(loan);
			} else if (loan._action == 'edit') {
				$scope.editLoan(loan);
			}
		});
	};

	$scope.deleteConfirmation = function (loanId) {
		var modalInstance = $uibModal.open({
			animation: $scope.animationsEnabled,
			templateUrl: 'html/confirmModal.html',
			controller: confirmModalController,
			size: 'sm',
			resolve: {
				data: function () {
					return loanId;
				},
				message: function () {
					return 'Confirma a exclusão do empréstimo?';
				}
			}
		});

		modalInstance.result.then(function (id) {
			$scope.deleteLoan(id);
		});
	};

	$scope.payLoanConfirmation = function (loanId) {
		var modalInstance = $uibModal.open({
			animation: $scope.animationsEnabled,
			templateUrl: 'html/confirmModal.html',
			controller: confirmModalController,
			size: 'sm',
			resolve: {
				data: function () {
					return loanId;
				},
				message: function () {
					return 'Confirma a quitação do empréstimo?'
				}
			}
		});

		modalInstance.result.then(function (id) {
			$scope.payLoan(id);
		});
	};

	$scope.getLoans = function () {
		$scope.loading = true;

		var filter = $scope.getFilter();

		Loans.get(filter)
			.then(function onSucess(response) {
				$scope.gridOptions.data = response.data;
				Utils.clearGridNav($scope.gridApi);
				$scope.selectedRow = null;
				$scope.loading = false;
			})
			.catch(function onError(response) {
				Utils.addError($scope, 'Erro ao carregar os dados: ' + response.status);
				$scope.loading = false;
			});
	};

	$scope.createLoan = function (loan) {
		$scope.loading = true;

		Loans.create(loan)
			.then(function onSucess() {
				Utils.addSucess($scope, 'Empréstimo adicionado com sucesso!');
				$scope.getLoans();
			})
			.catch(function onError(response) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + response.status);
				$scope.loading = false;
			});
	};

	$scope.editLoan = function (loan) {
		$scope.loading = true;

		Loans.patch(loan._id, loan)
			.then(function onSucess() {
				Utils.addSucess($scope, 'Empréstimo editado com sucesso!');
				$scope.getLoans();
			})
			.catch(function onError(response) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + response.status);
				$scope.loading = false;
			});
	};

	$scope.deleteLoan = function (id) {
		$scope.loading = true;

		Loans.delete(id)
			.then(function onSucess() {
				Utils.addSucess($scope, 'Empréstimo excluído com sucesso!');
				$scope.getLoans();
			})
			.catch(function onError(response) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + response.status);
				$scope.loading = false;
			});
	};

	$scope.payLoan = function (id) {
		$scope.loading = true;

		Loans.pay(id)
			.then(function onSucess() {
				Utils.addSucess($scope, 'Empréstimo quitado com sucesso!');
				$scope.getLoans();
			})
			.catch(function onError(response) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + response.status);
				$scope.loading = false;
			});
	};

	// initialization
	$scope.Utils = Utils;
	$scope.alerts = [];
	$scope.listPaidLoans = false;
	$scope.getLoans();
});
