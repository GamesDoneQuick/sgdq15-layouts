(function() {
    'use strict';

    var nameFields = [
        $('#sgdq15-interviewName1'),
        $('#sgdq15-interviewName2'),
        $('#sgdq15-interviewName3'),
        $('#sgdq15-interviewName4')
    ];

    var submitFields = [
        $('#sgdq15-interviewSubmit1'),
        $('#sgdq15-interviewSubmit2'),
        $('#sgdq15-interviewSubmit3'),
        $('#sgdq15-interviewSubmit4')
    ];

    var cancelFields = [
        $('#sgdq15-interviewCancel1'),
        $('#sgdq15-interviewCancel2'),
        $('#sgdq15-interviewCancel3'),
        $('#sgdq15-interviewCancel4')
    ];

    var updateNamesBtn = $('#sgdq15-interviewUpdateAll');
    var showBtn = $('#sgdq15-interviewShow');
    var hideBtn = $('#sgdq15-interviewHide');

    var interviewNames = nodecg.Replicant('interviewNames', {defaultValue: ['', '', '', '']})
        .on('change', function(oldVal, newVal) {
            newVal.forEach(function(name, idx) {
                nameFields[idx].val(name);
                submitFields[idx].attr('disabled', name === '');
            });
        });

    var isShowing = nodecg.Replicant('interviewShowing', {defaultValue: false})
        .on('change', function(oldVal, newVal) {
            showBtn.attr('disabled', newVal);
            hideBtn.attr('disabled', !newVal);
        });

    showBtn.click(function() {
        isShowing.value = true;
    });

    hideBtn.click(function() {
        isShowing.value = false;
    });

    updateNamesBtn.click(function() {
        interviewNames.value = [
            nameFields[0].val(),
            nameFields[1].val(),
            nameFields[2].val(),
            nameFields[3].val()
        ];
    });

    nameFields.forEach(function(name, idx) {
        name.keyup(function() {
            submitFields[idx].attr('disabled', this.value === '');
        });
    });

    submitFields.forEach(function(submit, idx) {
        submit.click(function() {
            interviewNames.value[idx] = nameFields[idx].val();
        });
    });

    cancelFields.forEach(function(cancel, idx) {
        cancel.click(function() {
            interviewNames.value[idx] = '';
            submitFields[idx].attr('disabled', this.value === '');
        });
    });
})();
