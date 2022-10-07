sap.ui.define([
    'sap/ui/core/mvc/Controller',
    "../model/Formatter",
    "sap/m/MessageBox",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Formatter, MessageBox, Spreadsheet, exportLibrary) {
        "use strict";
        var that;
        //JSONModel
        var estacionModel;

        var oSelectDialogEstacion
        var listEstacion = [];

        //Excel
        var EdmType = exportLibrary.EdmType;

        //CONSTANTES
        const PATH_SERVICE='https://www.agroparamonga.com/p_meteorologia';
        
        var oPageController = Controller.extend("aip.meteorologia.controller.Master", {
            formatter: Formatter,
            onInit: async function () {
                var that=this;
                console.log("onInit");
                //Valores iniciales
                var fecha = new Date().toISOString().substring(0, 10);
                console.log(`fecha: ${fecha}`);

                //fechaIn.toISOString().substring(0, 11)+'06:00:00';

                //var fechaIni = this._fechas(dt);
                //dt.setDate(dt.getDate()-1);
                //var fechaFin = this._fechas(dt);
                this.byId("dp1").setValue(fecha);
                this.byId("dp2").setValue(fecha);
                
                var dataQuery={
                    estacion:'000003',
                    fecini:'20150807',
                    fecfin:'20150807'
                };
                //Estaciones
                await this._estaciones();
                this._loadMatchcodeEstacion();

                //this._consulta(dataQuery);
                /* $.ajax({ 
                    //url:`https://www.agroparamonga.com/ppeso/muestra/pa?page=0&size=100&bal=08&fecIni=${date}&fecFin=${date}`,
                    url:`https://www.agroparamonga.com/q_meteorologia/metereologia/byDateRange?estacion=000003&fecfin=20150807&fecini=20150807`,   
                    dataType: "json",
                    success: function(result) {
                        var jsonModel = new sap.ui.model.json.JSONModel(result);
                        console.log("jsonModel");console.log(jsonModel);
                        that.getView().byId("tblMain").setModel(jsonModel);
                        //that.getView().byId("txtCount").setText(result.totalElements);
                        //console.log(that.getView().byId("txtCount").getText());                        
                        //that.loadMatchcodeFc();
                    },
                    error: function(response) {
                        alert("error");
                    }
                }); */
            },
            onFilter: async function (oEvent) {
                let estacion = this.getView().byId("txtEstacion").getValue();
                let fecini = this.getView().byId("dp1").getValue();
                let fecfin = this.getView().byId("dp2").getValue();
                console.log(estacion);
                console.log(fecini);
                console.log(fecfin);
                //console.log(`fecIni: ${fecIni}`);
                //this.getView().byId("txtCount").setText(""); 
                //this.getView().byId("txtActual").setText(""); 
                if (estacion == "" || estacion == undefined) {
                    MessageBox.error("Campo Estación es obligatorio.");
                    return;
                }
                if (fecini == "" || fecini == undefined) {
                    MessageBox.error("Campo Fecha Inicio es obligatorio.");
                    return;
                }
                if (fecfin == "" || fecfin == undefined) {
                    MessageBox.error("Campo Fecha Fin es obligatorio.");
                    return;
                }
                
                var dataQuery={
                    estacion:estacion,
                    fecini:fecini,
                    fecfin:fecfin
                };

                var that = this;
                //busyDialog.open();
                this._consulta(dataQuery);

                /* await new Promise(function (resolve, reject) {
                    $.ajax({ 
                        url:`https://www.agroparamonga.com/q_meteorologia/metereologia/byDateRange`,   
                        dataType: "json",
                        data:dataQuery,
                        success: function(result) {
                            var modelo = result;//.content;
                            //var tamanio = modelo.lenght=undefined?0:modelo.lenght;
                            var jsonModel = new sap.ui.model.json.JSONModel(modelo);
                            that.getView().byId("tblMain").setModel(jsonModel);
                            //that.getView().byId("txtCount").setText(result.totalElements);
                            //that.getView().byId("txtActual").setText(`${tamanio} de`);
                                 
                        },
                        error: function(response) {
                            alert("error de consulta");
                        }

                    });
                }); */

            },
            _consulta:function(dataQuery){
                var that=this;
                $.ajax({ 
                    url:`https://www.agroparamonga.com/p_meteorologia/metereologia/byDateRange`,   
                    dataType: "json",
                    data:dataQuery,
                    success: function(result) {
                        var jsonModel = new sap.ui.model.json.JSONModel(result);
                        console.log("jsonModel");console.log(jsonModel);
                        that.getView().byId("tblMain").setModel(jsonModel);
                    },
                    error: function(response) {
                        alert("error");
                    }
                });
            },
            /*
            _valoresNominales:function(){
                return new Promise(function (resolve, reject) {
                    $.ajax({ 
                        url:`${PATH_SERVICE}/maestro/valorNominal`,   
                        dataType: "json",
                        success: function(result) {
                            valNomModel = new sap.ui.model.json.JSONModel(result);
                            resolve({data: 'Finalizado'});
                        },
                        error: function(response) {
                            alert("error");
                        }
                    });
                });
            }*/
            _estaciones:async function(){
                return new Promise(function (resolve, reject) {
                    $.ajax({ 
                        url:`${PATH_SERVICE}/estacion`,
                        //http://localhost:8082/estacion
                        dataType: "json",
                        success: function(result) {
                            console.log("_estaciones: ");
                            console.log(result);
                            estacionModel = new sap.ui.model.json.JSONModel(result);
                            resolve({data: 'This was Example 6'});
                        },
                        complete:function (data){
                            sap.m.MessageToast.show("Carga completa de Estaciones") ;
                        },
                        error: function(response) {
                            alert("error");
                        }
                    });
                });
            },
            _loadMatchcodeEstacion: function () {
                that = this;
                const handleClose = function (oEvent) {
                    // obtener fila seleccionada
                    let oSelectedItem = oEvent.getParameter("selectedItem");
                    let oInput = that.getView().byId("txtEstacion");
                    
                    if (oSelectedItem) {
                        oInput.setValue(oSelectedItem.getTitle());// asignar valor en campo
                    }
                    // limpiar filtros (en caso de existir)
                    oEvent.getSource().getBinding("items").filter([]);
                };
                
                const oModel = new sap.ui.model.json.JSONModel();
                // invocación de servicio
                /*
                oDataModel.read("/centroSet", {
                    success: function (oData, oResponse) {
                        console.log( "Respuestas centros SEt" );
                        oModel.setData(oData);
                        //console.log( oData );
                        centros = oSelectDialog.getModel('oDataCentros').getData().results;
                    },
                    error: function (oError) {
                        MessageToast.show("Error");
                    }
                });*/
                try {
                    oModel.setData(estacionModel);
                    listEstacion=estacionModel.oData;
                } catch (error) {
                    console.log("error");    
                }

                var itemTemplate = new sap.m.StandardListItem({
                    title: "{oDataEstacion>meteorolEstacion}",
                    description: "{oDataEstacion>descripcion}"
                })

                if(!oSelectDialogEstacion){
                    // creación de control de ayuda de busqueda
                    oSelectDialogEstacion = new sap.m.SelectDialog("EstacionDialog", {
                    title: "Estacion",
                    liveChange: function (oEvent) {
                        var sValue = oEvent.getParameter("value");
                        var oFilter = new sap.ui.model.Filter("descripcion", sap.ui.model.FilterOperator.Contains, sValue);
                        var oBinding = oEvent.getSource().getBinding("items");
                        oBinding.filter([oFilter]);
                    },
                    confirm: handleClose
                });
                }
                

                // carga de datos odata en ventana
                oSelectDialogEstacion.setModel(oModel, 'oDataEstacion');
                oSelectDialogEstacion.bindAggregation("items", "oDataEstacion>/oData", itemTemplate);                
            },
            onOpenDialogPressEstacion: function (oEvent) {
                oSelectDialogEstacion.open(); // mostrar ventana de matchcode de estaciones
            },
            onChangeEstacion: function ( oEvent ) {
                let valor = oEvent.getParameter('value');
                //console.log(listEstacion);
                this.getView().byId("btnFiltro").setEnabled( true ); // boton filtro activado
                oEvent.getSource().setValueState( sap.ui.core.ValueState.None );

                if ( valor ) {
                    for (const iterator of listEstacion) {
                        console.log(iterator.item);
                        if ( iterator.meteorolEstacion == valor ) {
                            return;
                        } 
                    }
                    oEvent.getSource().setValueState( sap.ui.core.ValueState.Error );
                    this.getView().byId("btnFiltro").setEnabled( false ); // boton filtro desactivado

                } 
            },
            onExport: function () {
                console.log("export event");
                var aCols, oRowBinding, oSettings, oSheet, oTable;

                if (!this._oTable) {
                    this._oTable = this.byId('tblMain');
                }

                oTable = this._oTable;
                oRowBinding = oTable.getBinding('rows');
                aCols = this.createColumnConfig();

                oSettings = {
                    workbook: {
                        columns: aCols, // asignación de columnas 
                        hierarchyLevel: 'Level'
                    },
                    dataSource: oRowBinding,
                    fileName: 'reporte.xlsx', // nombre de archivo a descargar
                    worker: true
                };

                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });

            },
            createColumnConfig: function () {

                // definición de columnas a exportar
                var aCols = [];
                var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                
                console.log( oResourceBundle.getText('FECHA') );                

                aCols.push({ label: oResourceBundle.getText('FECHA'), property: 'fecha', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('METEOROLESTACION'), property: 'meteorolEstacion', type: EdmType.String });
                /*aCols.push({ label: oResourceBundle.getText('FRGKZ'), property: 'Frgkz', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('FRGZU'), property: 'Frgzu', type: EdmType.String });*/
                aCols.push({ label: oResourceBundle.getText('TEMPOUT'), property: 'tempOut', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('HITEMP'), property: 'hiTemp', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('LOWTEMP'), property: 'lowTemp', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('OUTHUM'), property: 'outHum', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('DEWPT'), property: 'dewPt', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('WINDSPEED'), property: 'windSpeed', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('WINDDIR'), property: 'windDir', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('WINDRUN'), property: 'winRun', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('HISPEED'), property: 'hiSpeed', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('HIDIR'), property: 'hiDir', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('WINDCHILL'), property: 'windChill', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('HEATINDEX'), property: 'heatIndex', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('THXINDEX'), property: 'thxIndex', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('THSWINDEX'), property: 'thswIndex', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('BAR'), property: 'bar', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('RAIN'), property: 'rain', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('RAINRATE'), property: 'rainRate', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('SOLARRAD'), property: 'solarRad', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('SOLARENERGY'), property: 'solarEnergy', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('HIRAD'), property: 'hiRad', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('SOLARUVINDEX'), property: 'solarUvIndex', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('UVDOSE'), property: 'uvDose', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('HIUV'), property: 'hiUv', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('HEATDD'), property: 'heatDd', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('COOLDD'), property: 'coolDd', type: EdmType.String});
                aCols.push({ label: oResourceBundle.getText('INTEMP'), property: 'inTemp', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('INHUM'), property: 'inHum', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('INDEW'), property: 'inDew', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('INHEAT'), property: 'inHeat', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('INEMC'), property: 'inEmc', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('INAIRDENSITY'), property: 'inAirDensity', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('ET'), property: 'et', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('WINDSAMP'), property: 'windSamp', type: EdmType.Number, scale: 0 });
                aCols.push({ label: oResourceBundle.getText('WINDTX'), property: 'windTx', type: EdmType.Number, scale: 0, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('ISSRECEPT'), property: 'issRecept', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('ARCINT'), property: 'arcInt', type: EdmType.Number, scale: 2, delimiter: true });
                
                return aCols;
            },

        }); 

        return oPageController;
    });
