var Wizard = function ($parentDom) {
    this.$parentDom = $parentDom;
    this.totalStepsLength = this.$parentDom.find('[data-step]').length;
};
Wizard.prototype.nextStep = function () {
    var $currentStep = this.$parentDom.find('.active');
    var $nextStep = $currentStep.next();
    if($nextStep.length){
        $currentStep.animate({
            left: -500,
            opacity: 0
        }, function () {
            $nextStep.css({
                left: 500,
                opacity: 0,
                display: 'block'
            }).animate({
                left: 0,
                opacity: 1
            });
        });

    }
};