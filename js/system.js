$('#scaled').on('click', function() {
    if( $('#scaled').hasClass('toggle-off') ) reset();
    update();
})

$('#sort').on('click', function(){ 
    sortX(svg.transition())
});

$('#play').on('click', function(){ 
    if( timeoutplay ) clearTimeout(timeoutplay)
});

$('#type').on('click', function(){ 
    filename = $('#type').hasClass('toggle-off') ? 'regions' : 'departements';
    changetype();
    location.hash = "#" + [field.id, year,filename].join("/");
});

$(document).on('click', function (e) {
    $('.dk_container').each(function () {
        $(this).removeClass('dk_open');
    });
});

$('#field')
.on("change", function(e) {
    field = fields[this.selectedIndex];
	location.hash = "#" + [field.id, year].join("/");
});

$('#year')
.on("change", function(e) {
    year = years[this.selectedIndex];
	location.hash = "#" + [field.id, year].join("/");
});
