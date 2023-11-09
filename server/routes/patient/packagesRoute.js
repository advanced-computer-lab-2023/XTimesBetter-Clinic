var router = require('express').Router();
const {ViewPackage,ViewLinkedFam,Subscribe,Unsubscribe,Famsubs,Allsubs,Allpatients,Subscribe1,Subscribe2} = require('../../controllers/patient/PackagesController');

// APIs

router.get('/viewP',ViewPackage);
router.get('/viewF',ViewLinkedFam);
router.get('/Allsubs',Allsubs);
router.get('/Allpatients',Allpatients);
router.get('/Famsubs',Famsubs);

router.post('/',Subscribe);
router.post('/un',Unsubscribe);

router.post('/subs1',Subscribe1);
router.post('/subs2',Subscribe2);



module.exports = router;