ej.base.enableRipple(true);
ej.grids.Grid.Inject(
    ej.grids.DomVirtualization
);

(function () {
    'use strict';

    /* ─── Control references ─────────────────────────────────────────────────── */
    var grid                  = null;
    var domTypeDropdown       = null;
    var dataCountDropdown     = null;
    var filterTypeDropdown    = null;
    var editModeDropdown      = null;
    var selectionModeDropdown = null;
    var rowBufferNumeric      = null;
    var scrollThrottleNum     = null;
    var maxPoolSizeNum        = null;
    var rowHeightNum          = null;

    /* ─── Template helpers ───────────────────────────────────────────────────── */

    window.ratingDetail = function (e) {
        var temp = document.getElementsByTagName('template')[0];
        var cloneTemplate = temp.content.cloneNode(true);
        var ratingElement = cloneTemplate.querySelector('.rating');
        var rating = new ej.inputs.Rating({ value: e.Rating, readOnly: true, cssClass: 'custom-rating' });
        rating.appendTo(ratingElement);
        return ratingElement.ej2_instances[0].wrapper.outerHTML;
    };

    window.priorityDetail = function (e) {
        var map = { High: 'e-highcolor', Low: 'e-lowcolor', Medium: 'e-mediumcolor', Critical: 'e-criticalcolor' };
        var css  = map[e.Priority] || 'e-lowcolor';
        var div  = document.createElement('div');
        var span = document.createElement('span');
        span.className = 'virtual-statustxt ' + css;
        span.textContent = e.Priority || '';
        div.className = 'virtual-statustemp ' + css;
        div.appendChild(span);
        return div.outerHTML;
    };

    window.paymentStatusDetail = function (e) {
        var map = { Paid: 'e-paidcolor', Pending: 'e-pendingcolor', Refunded: 'e-refundcolor', Refund: 'e-refundcolor', Failed: 'e-failedcolor' };
        var val  = (e.PaymentStatus || '').toString();
        var css  = map[val] || 'e-pendingcolor';
        var div  = document.createElement('div');
        var span = document.createElement('span');
        span.className = 'virtual-statustxt ' + css;
        span.textContent = val;
        div.className = 'virtual-statustemp ' + css;
        div.appendChild(span);
        return div.outerHTML;
    };

    window.orderStatusDetail = function (e) {
        var map = {
            Delivered: 'e-deliveredcolor', Shipped: 'e-shippedcolor', Packed: 'e-packedcolor',
            Processing: 'e-processingcolor', Canceled: 'e-cancelcolor', Cancel: 'e-cancelcolor',
            Returned: 'e-returnedcolor', Ordered: 'e-orderedcolor'
        };
        var val  = (e.OrderStatus || '').toString();
        var css  = map[val] || 'e-orderedcolor';
        var div  = document.createElement('div');
        var span = document.createElement('span');
        span.className = 'virtual-statustxt ' + css;
        span.textContent = val;
        div.className = 'virtual-statustemp ' + css;
        div.appendChild(span);
        return div.outerHTML;
    };

    window.paymentTemplate = function (e) {
        var div  = document.createElement('div');
        div.className = 'e-payment-info';
        var img  = document.createElement('img');
        img.src  = '//ej2.syncfusion.com/javascript/demos/src/grid/images/payment/' + e.PaymentMethod + '.svg';
        img.alt  = e.PaymentMethod;
        var span = document.createElement('span');
        span.innerText = e.PaymentMethod;
        div.appendChild(img);
        div.appendChild(span);
        return div.outerHTML;
    };

    window.rowDetail = function (data) {
        var init  = data.CustomerName ? data.CustomerName.charAt(0).toUpperCase() : '?';
        var total = data.TotalAmount != null ? ('$' + (+data.TotalAmount).toFixed(2)) : '$0.00';
        var dt    = data.OrderDate ? new Date(data.OrderDate).toLocaleDateString() : '';
        return '<tr class="e-row">' +
            '<td class="e-rowcell" style="padding:8px 12px"><strong>' + (data.OrderID || '') + '</strong></td>' +
            '<td class="e-rowcell" style="padding:8px 12px"><div class="customer-name-cell"><div class="customer-avatar">' + init + '</div><span>' + (data.CustomerName || '') + '</span></div></td>' +
            '<td class="e-rowcell" style="padding:8px 12px"><span class="country-badge">'  + (data.ShipCountry || '') + '</span></td>' +
            '<td class="e-rowcell" style="padding:8px 12px"><span class="product-badge">'  + (data.ProductName || '') + '</span></td>' +
            '<td class="e-rowcell" style="padding:8px 12px"><span class="category-badge">' + (data.Category    || '') + '</span></td>' +
            '<td class="e-rowcell" style="padding:8px 12px">' + window.orderStatusDetail(data)   + '</td>' +
            '<td class="e-rowcell" style="padding:8px 12px">' + window.priorityDetail(data)      + '</td>' +
            '<td class="e-rowcell" style="padding:8px 12px">' + window.paymentStatusDetail(data) + '</td>' +
            '<td class="e-rowcell" style="padding:8px 12px;text-align:right"><strong>' + total + '</strong></td>' +
            '<td class="e-rowcell" style="padding:8px 12px">' + window.ratingDetail(data) + '</td>' +
            '<td class="e-rowcell" style="padding:8px 12px">' + dt + '</td>' +
        '</tr>';
    };

    window.detailTemplateContent = function (data) {
        var od = data.OrderDate ? new Date(data.OrderDate).toLocaleDateString() : 'N/A';
        var sd = data.ShipDate  ? new Date(data.ShipDate).toLocaleDateString()  : 'N/A';
        return '<div class="detail-template-container"><div class="detail-template-grid">' +
            '<div class="detail-item"><strong>Order ID</strong>'       + (data.OrderID       || '') + '</div>' +
            '<div class="detail-item"><strong>Customer</strong>'       + (data.CustomerName  || '') + '</div>' +
            '<div class="detail-item"><strong>Email</strong><a class="email-link" href="mailto:' + (data.Email || '') + '">' + (data.Email || '') + '</a></div>' +
            '<div class="detail-item"><strong>Phone</strong>'          + (data.Phone         || '') + '</div>' +
            '<div class="detail-item"><strong>Country</strong>'        + (data.ShipCountry   || '') + '</div>' +
            '<div class="detail-item"><strong>City</strong>'           + (data.ShipCity      || '') + '</div>' +
            '<div class="detail-item"><strong>Ship Address</strong>'   + (data.ShipAddress   || '') + '</div>' +
            '<div class="detail-item"><strong>Product</strong>'        + (data.ProductName   || '') + '</div>' +
            '<div class="detail-item"><strong>Category</strong>'       + (data.Category      || '') + '</div>' +
            '<div class="detail-item"><strong>Quantity</strong>'       + (data.Quantity      || 0)  + '</div>' +
            '<div class="detail-item"><strong>Unit Price</strong>$'    + (data.UnitPrice     || 0)  + '</div>' +
            '<div class="detail-item"><strong>Discount</strong>'       + (data.Discount      || 0)  + '%</div>' +
            '<div class="detail-item"><strong>Tax</strong>'            + (data.Tax           || 0)  + '%</div>' +
            '<div class="detail-item"><strong>SubTotal</strong>$'      + (data.SubTotal      || 0)  + '</div>' +
            '<div class="detail-item"><strong>Ship Fee</strong>$'      + (data.ShipFee       || 0)  + '</div>' +
            '<div class="detail-item"><strong>Total Amount</strong>$'  + (data.TotalAmount   || 0)  + '</div>' +
            '<div class="detail-item"><strong>Order Date</strong>'     + od + '</div>' +
            '<div class="detail-item"><strong>Ship Date</strong>'      + sd + '</div>' +
            '<div class="detail-item"><strong>Payment Method</strong>' + (data.PaymentMethod || '') + '</div>' +
            '<div class="detail-item"><strong>Payment Status</strong>' + window.paymentStatusDetail(data) + '</div>' +
            '<div class="detail-item"><strong>Priority</strong>'       + window.priorityDetail(data)      + '</div>' +
            '<div class="detail-item"><strong>Rating</strong>'         + window.ratingDetail(data)        + '</div>' +
            '<div class="detail-item"><strong>Warehouse</strong>'      + (data.Warehouse      || '') + '</div>' +
            '<div class="detail-item"><strong>Inventory</strong>'      + (data.InventoryCount || 0)  + '</div>' +
        '</div></div>';
    };

    /* ─── Helpers ────────────────────────────────────────────────────────────── */

    function isChecked(id) {
        var el = document.getElementById(id);
        return el ? el.checked : false;
    }

    function getNumVal(comp, def) {
        if (!comp) { return def; }
        var v = comp.value;
        return (v !== null && v !== undefined && !isNaN(v)) ? parseInt(v, 10) : def;
    }

    /* ─── Column definitions ─────────────────────────────────────────────────── */

    function getColumns(opts) {
        if (opts.rowTemplate) {
            return [
                { headerText: 'Order ID',       width: 110 },
                { headerText: 'Customer Name',  width: 190 },
                { headerText: 'Country',        width: 150 },
                { headerText: 'Product',        width: 250 },
                { headerText: 'Category',       width: 120 },
                { headerText: 'Order Status',   width: 140 },
                { headerText: 'Priority',       width: 120 },
                { headerText: 'Payment Status', width: 140 },
                { headerText: 'Total Amount',   width: 130 },
                { headerText: 'Rating',         width: 160 },
                { headerText: 'Order Date',     width: 140 }
            ];
        }

        var cols = [];
        if (opts.checkbox) { cols.push({ type: 'checkbox', width: 50 }); }

        cols.push({ field: 'OrderID',        headerText: 'Order ID',       width: 110, isPrimaryKey: true, textAlign: 'Right',  validationRules: { required: true } });
        cols.push({ field: 'OrderDate',      headerText: 'Order Date',     width: 140, type: 'date', format: 'yMd', textAlign: 'Right', editType: 'datepickeredit' });
        cols.push({ field: 'ShipDate',       headerText: 'Ship Date',      width: 140, type: 'date', format: 'yMd', textAlign: 'Right', editType: 'datepickeredit' });
        cols.push({ field: 'OrderStatus',    headerText: 'Order Status',   width: 140, textAlign: 'Center', editType: 'dropdownedit', template: '#orderStatusTemplate', validationRules: { required: true } });
        cols.push({ field: 'Priority',       headerText: 'Priority',       width: 120, textAlign: 'Center', editType: 'dropdownedit', template: '#priorityTemplate',    validationRules: { required: true } });
        cols.push({
            field: 'CustomerName', headerText: 'Customer Name', width: 190, validationRules: { required: true },
            template: opts.colTemplate ? '<div class="customer-name-cell"><div class="customer-avatar">${CustomerName ? CustomerName.charAt(0).toUpperCase() : "?"}</div><span>${CustomerName}</span></div>' : undefined
        });
        cols.push({ field: 'CustomerID',     headerText: 'Customer ID',    width: 110, visible: false });
        cols.push({
            field: 'Email', headerText: 'Email', width: 200,
            template: opts.colTemplate ? '<a class="email-link" href="mailto:${Email}">${Email}</a>' : undefined
        });
        cols.push({ field: 'Phone',          headerText: 'Phone Number',   width: 140, textAlign: 'Right' });
        cols.push({ field: 'ShipAddress',    headerText: 'Ship Address',   width: 180 });
        cols.push({ field: 'ShipCity',       headerText: 'Ship City',      width: 120 });
        cols.push({ field: 'ShipState',      headerText: 'Ship State',     width: 130 });
        cols.push({ field: 'ShipPostalCode', headerText: 'Postal Code',    width: 130, textAlign: 'Right' });
        cols.push({
            field: 'ShipCountry', headerText: 'Ship Country', width: 150,
            template: opts.colTemplate ? '<span class="country-badge">${ShipCountry}</span>' : undefined
        });
        cols.push({
            field: 'ProductName', headerText: 'Product Name', width: 250,
            template: opts.colTemplate ? '<span class="product-badge">${ProductName}</span>' : undefined
        });
        cols.push({ field: 'ProductID',      headerText: 'Product ID',     width: 110, visible: false });
        cols.push({
            field: 'Category', headerText: 'Category', width: 120,
            template: opts.colTemplate ? '<span class="category-badge">${Category}</span>' : undefined
        });
        cols.push({ field: 'Warehouse',      headerText: 'Warehouse',      width: 110, visible: false, editType: 'dropdownedit' });
        cols.push({ field: 'InventoryCount', headerText: 'Inventory',      width: 130, textAlign: 'Right', visible: false });
        cols.push({ field: 'Quantity',       headerText: 'Quantity',       width: 100, textAlign: 'Right', editType: 'numericedit', edit: { params: { showSpinButton: false } } });
        cols.push({ field: 'UnitPrice',      headerText: 'Unit Price',     width: 110, format: 'C2',  textAlign: 'Right', editType: 'numericedit', edit: { params: { showSpinButton: false } } });
        cols.push({ field: 'Discount',       headerText: 'Discount (%)',   width: 120, textAlign: 'Right', editType: 'numericedit', edit: { params: { showSpinButton: false } } });
        cols.push({ field: 'Tax',            headerText: 'Tax (%)',        width: 100, textAlign: 'Right', editType: 'numericedit', edit: { params: { showSpinButton: false } } });
        cols.push({ field: 'SubTotal',       headerText: 'Sub Total',      width: 120, format: 'C2',  textAlign: 'Right', editType: 'numericedit', edit: { params: { showSpinButton: false } } });
        cols.push({ field: 'TaxAmount',      headerText: 'Tax Amount',     width: 120, format: 'C2',  textAlign: 'Right', editType: 'numericedit', edit: { params: { showSpinButton: false } } });
        cols.push({ field: 'ShipFee',        headerText: 'Ship Fee',       width: 110, format: 'C2',  textAlign: 'Right', editType: 'numericedit', edit: { params: { showSpinButton: false } } });
        cols.push({ field: 'TotalAmount',    headerText: 'Total Amount',   width: 130, format: 'C2',  textAlign: 'Right', editType: 'numericedit', edit: { params: { showSpinButton: false } } });
        cols.push({ field: 'PaymentMethod',  headerText: 'Payment Method', width: 145, editType: 'dropdownedit', template: '#paymentTemplate',       validationRules: { required: true } });
        cols.push({ field: 'PaymentStatus',  headerText: 'Payment Status', width: 140, textAlign: 'Center', editType: 'dropdownedit', template: '#paymentStatusTemplate', validationRules: { required: true } });
        cols.push({ field: 'Rating',         headerText: 'Delivery Rating', width: 160, textAlign: 'Center', template: '#ratingTemplate', editType: 'dropdownedit' });

        return cols;
    }

    /* ─── Build grid config ──────────────────────────────────────────────────── */

    function    buildConfig(data) {
        var useVirtual   = isChecked('virtualScrollCheckbox');
        var useInfinite  = isChecked('infiniteScrollCheckbox') && !useVirtual;
        var useDomVirt   = isChecked('domVirtualizationCheckbox');
        var usePaging    = isChecked('pagingCheckbox') && !useVirtual && !useInfinite;
        var useGroup     = isChecked('groupingCheckbox');
        var useFrozen    = isChecked('frozenCheckbox');
        var useHierarchy = isChecked('hierarchyGridCheckbox');
        var useDetailTpl = isChecked('detailTemplateCheckbox') && !useHierarchy;
        var useRowTpl    = isChecked('rowTemplateCheckbox');
        var useAutoH     = isChecked('autoRowHeightCheckbox');
        var useSetH      = isChecked('setRowHeightCheckbox') && !useAutoH && useDomVirt;
        var useEditing   = isChecked('editingCheckbox');
        var useExport    = isChecked('exportCheckbox');
        var useSearch    = isChecked('searchCheckbox');

        var domVirtType = domTypeDropdown       ? (domTypeDropdown.value       || 'Both')   : 'Both';
        var filterType  = filterTypeDropdown    ? (filterTypeDropdown.value    || 'Menu')   : 'Menu';
        var editMode    = editModeDropdown      ? (editModeDropdown.value      || 'Normal') : 'Normal';
        var selMode     = selectionModeDropdown ? (selectionModeDropdown.value || 'Row')    : 'Row';
        var rowBuf      = getNumVal(rowBufferNumeric,  5);
        var scrollThr   = getNumVal(scrollThrottleNum, 0);
        var maxPool     = getNumVal(maxPoolSizeNum,    500);
        var rowH        = getNumVal(rowHeightNum,      0);

        /* Toolbar */
        var toolbar = [];
        if (useEditing) { toolbar.push('Add', 'Edit', 'Delete', 'Update', 'Cancel'); }
        if (useSearch)  { toolbar.push('Search'); }
        if (isChecked('columnChooserCheckbox')) { toolbar.push('ColumnChooser'); }
        if (useExport)  { grid.allowExcelExport = true; grid.allowPdfExport = true; toolbar.push('ExcelExport', 'PdfExport', 'CsvExport'); }

        var colOpts = {
            rowTemplate : useRowTpl,
            checkbox    : isChecked('checkboxSelectionCheckbox'),
            colTemplate : isChecked('columnTemplateCheckbox')
        };

        var cfg = {
            dataSource             : data,
            height                 : 500,
            clipMode               : 'EllipsisWithTooltip',
            enableVirtualization   : useVirtual,
            enableInfiniteScrolling: useInfinite,
            enableDomVirtualization: useDomVirt,
            allowFiltering         : isChecked('filterCheckbox'),
            allowSorting           : isChecked('sortingCheckbox'),
            allowPaging            : usePaging,
            allowGrouping          : useGroup,
            allowRowDragAndDrop    : isChecked('rowReorderCheckbox'),
            allowReordering        : isChecked('columnReorderCheckbox'),
            allowResizing          : isChecked('resizingCheckbox'),
            showColumnChooser      : isChecked('columnChooserCheckbox'),
            enableRtl              : isChecked('rtlCheckbox'),
            allowTextWrap          : isChecked('textWrapCheckbox'),
            selectionSettings      : { type: 'Multiple', mode: selMode },
            columns                : getColumns(colOpts)
        };

        if (toolbar.length) { cfg.toolbar = toolbar; }

        if (useVirtual)  { cfg.pageSettings = { pageSize: 50 }; }
        if (usePaging)   { cfg.pageSettings = { pageSize: 20, pageSizes: [10, 20, 50, 100] }; }
        if (useInfinite) { cfg.pageSettings = { pageSize: 50 }; }

        if (isChecked('filterCheckbox')) { cfg.filterSettings = { type: filterType }; }

        if (useDomVirt) {
            cfg.domVirtualizationSettings = {
                virtualDomType : domVirtType,
                rowBuffer      : rowBuf,
                scrollThrottle : scrollThr,
                maxPoolSize    : maxPool,
                autoRowHeight  : useAutoH
            };
        }

        if (useSetH) {
            cfg.setRowHeight = function (row) {
                var map = { Critical: 90, High: 70, Medium: 55, Low: 45 };
                return (row && row.data && map[row.data.Priority]) || 45;
            };
        }

        if (rowH > 0) { cfg.rowHeight = rowH; }

        if (useFrozen) { cfg.frozenRows = 2; cfg.frozenColumns = 2; }

        if (isChecked('pinnedRowsCheckbox')) {
            cfg.isRowPinned = function (args) {
                return args.data && (args.data.OrderID === 'ORD-1001' || args.data.OrderID === 'ORD-1002' || args.data.OrderID === 'ORD-1003');
            };
        }

        if (isChecked('contextMenuCheckbox')) {
            cfg.contextMenuItems = ['AutoFit', 'AutoFitAll', 'SortAscending', 'SortDescending', 'Copy', 'FirstPage', 'PrevPage', 'LastPage', 'NextPage'];
        }

        if (useGroup) { cfg.groupSettings = { showDropArea: true }; }

        if (isChecked('aggregateCheckbox') && !useVirtual && !useInfinite) {
            cfg.aggregates = [{
                columns: [
                    { type: 'Sum',   field: 'TotalAmount', format: 'C2', footerTemplate: 'Total: ${Sum}' },
                    { type: 'Sum',   field: 'SubTotal',    format: 'C2', footerTemplate: 'SubTotal: ${Sum}' },
                    { type: 'Count', field: 'OrderID',                   footerTemplate: 'Orders: ${Count}' }
                ]
            }];
        }

        if (isChecked('rowSpanCheckbox') || isChecked('colSpanCheckbox')) {
            var applyRS = isChecked('rowSpanCheckbox');
            var applyCS = isChecked('colSpanCheckbox');
            cfg.enableRowSpan = applyRS;
            cfg.enableColumnSpan = applyCS;
        }

        if (useEditing) {
            cfg.editSettings = { allowEditing: true, allowAdding: true, allowDeleting: true, mode: editMode, newRowPosition: 'Top' };
        }

        if (useExport) {
            cfg.toolbarClick = function (args) {
                if      (args.item.id.indexOf('_excelexport') !== -1) { grid.excelExport(); }
                else if (args.item.id.indexOf('_pdfexport')   !== -1) { grid.pdfExport();   }
                else if (args.item.id.indexOf('_csvexport')   !== -1) { grid.csvExport();   }
            };
        }

        if (useRowTpl)    { cfg.rowTemplate = '#rowTemplate'; }

        if (useDetailTpl) { cfg.detailTemplate = '#detailTemplate'; cfg.detailTemplateHeight = 250; }

        if (useHierarchy && !useRowTpl) {
            cfg.childGrid = {
                dataSource : data.slice(0, 500),
                queryString: 'CustomerName',
                columns: [
                    { field: 'OrderID',     headerText: 'Order ID', width: 110, textAlign: 'Right' },
                    { field: 'ProductName', headerText: 'Product',  width: 180 },
                    { field: 'OrderStatus', headerText: 'Status',   width: 140, template: '#orderStatusTemplate' },
                    { field: 'TotalAmount', headerText: 'Total',    width: 130, textAlign: 'Right', format: 'C2' },
                    { field: 'OrderDate',   headerText: 'Date',     width: 140, type: 'date', format: { type: 'date', format: 'MMM dd, yyyy' } }
                ],
                height: 200
            };
        }

        return cfg;
    }

    /* ─── Rebuild grid ───────────────────────────────────────────────────────── */

    function rebuildGrid() {
        if (grid && !grid.isDestroyed) { try { grid.destroy(); } catch (e) { /* ignore */ } }
        var el = document.getElementById('Grid');
        if (el) { el.innerHTML = ''; }
        var count = dataCountDropdown ? (parseInt(dataCountDropdown.value, 10) || 10000) : 10000;
        var data  = window.virtualOrderData.slice(0, count);
        grid = new ej.grids.Grid(buildConfig(data));
        grid.appendTo('#Grid');
    }

    /* ─── Entry point ────────────────────────────────────────────────────────── */

    document.addEventListener('DOMContentLoaded', function () {

        window.createVirtualOrderData();

        domTypeDropdown = new ej.dropdowns.DropDownList({ dataSource: ['Row', 'Column', 'Both'], value: 'Both', change: rebuildGrid });
        domTypeDropdown.appendTo('#virtualDomTypeDropdown');

        dataCountDropdown = new ej.dropdowns.DropDownList({
            dataSource: [{ text: '1,000', value: 1000 }, { text: '5,000', value: 5000 }, { text: '10,000', value: 10000 }, { text: '50,000', value: 50000 }, { text: '1,00,000', value: 100000 }],
            fields: { text: 'text', value: 'value' }, value: 10000, change: rebuildGrid
        });
        dataCountDropdown.appendTo('#dataCountDropdown');

        filterTypeDropdown = new ej.dropdowns.DropDownList({ dataSource: ['Menu', 'Excel', 'CheckBox'], value: 'Menu', change: rebuildGrid });
        filterTypeDropdown.appendTo('#filterTypeDropdown');

        editModeDropdown = new ej.dropdowns.DropDownList({ dataSource: ['Normal', 'Dialog', 'Cell'], value: 'Normal', change: rebuildGrid });
        editModeDropdown.appendTo('#editModeDropdown');

        selectionModeDropdown = new ej.dropdowns.DropDownList({ dataSource: ['Row', 'Cell', 'Both'], value: 'Row', change: rebuildGrid });
        selectionModeDropdown.appendTo('#selectionModeDropdown');

        rowBufferNumeric  = new ej.inputs.NumericTextBox({ value: 5,    min: 1,  max: 100,   format: 'n0', change: rebuildGrid });
        rowBufferNumeric.appendTo('#rowBufferInput');

        scrollThrottleNum = new ej.inputs.NumericTextBox({ value: 0,    min: 0,  max: 2000,  format: 'n0', change: rebuildGrid });
        scrollThrottleNum.appendTo('#scrollThrottleInput');

        maxPoolSizeNum    = new ej.inputs.NumericTextBox({ value: 500,  min: 10, max: 10000, format: 'n0', change: rebuildGrid });
        maxPoolSizeNum.appendTo('#maxPoolSizeInput');

        rowHeightNum      = new ej.inputs.NumericTextBox({ value: 50, min: 20, max: 300,   format: 'n0', placeholder: 'Auto', change: rebuildGrid });
        rowHeightNum.appendTo('#rowHeightInput');

        var checkboxIds = [
            'filterCheckbox', 'sortingCheckbox', 'pagingCheckbox', 'groupingCheckbox',
            'rowReorderCheckbox', 'columnReorderCheckbox', 'resizingCheckbox', 'columnChooserCheckbox',
            'aggregateCheckbox', 'contextMenuCheckbox', 'rtlCheckbox', 'frozenCheckbox',
            'pinnedRowsCheckbox', 'columnTemplateCheckbox', 'textWrapCheckbox', 'hierarchyGridCheckbox',
            'detailTemplateCheckbox', 'rowSpanCheckbox', 'colSpanCheckbox', 'checkboxSelectionCheckbox',
            'rowTemplateCheckbox', 'virtualScrollCheckbox', 'infiniteScrollCheckbox',
            'domVirtualizationCheckbox', 'setRowHeightCheckbox', 'autoRowHeightCheckbox',
            'editingCheckbox', 'exportCheckbox', 'searchCheckbox'
        ];
        checkboxIds.forEach(function (id) {
            var el = document.getElementById(id);
            if (el) { el.addEventListener('change', rebuildGrid); }
        });

        var dvEl = document.getElementById('domVirtualizationCheckbox');
        if (dvEl) { dvEl.checked = true; }

        rebuildGrid();
    });

}());

