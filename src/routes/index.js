// module.exports = function(app,Course)
// {
//     //Get all course
//     //find 메서드 - query를 파라미터 값으로 전달할 수 있음. 파라미터가 없다면 모든 데이터를 조회
//     app.get('/api/courses',function(req,res){
//         Course.find(function(err,courses){
//             if(err) return res.status(500).send({error:'database failure'});
//             res.json(courses);
//         })
//     });

//     //Get single course
//     app.get('/api/courses/:course_id',function(req,res){
//         Course.findOne({_id:req.params.course_id},function(err,course){
//             if(err) return res.status(500).json({error:err});
//             if(!course) return res.status(404).json({error:'Course not found'});
//             res.json(course);
//         })
//     });
//     // GET course by teacher - 나중에 teacher id 가져오면 하기
//     // app.get('/api/courses/teacher/:teacher', function(req, res){
//     //     
//     // });

//     // CREATE COURSE
//     app.post('/api/courses', function(req, res){
//         var course = new Course();
//         course.title = req.body.title;
//         //course.t_member_id = req.body.t_member_id;
//         course.day = req.body.day;
//         course.start_time = req.body.start_time;

//         course.save(function(err){
//         if(err){
//             console.error(err);
//             res.json({result: 0});
//             return;
//         }

//         res.json({result: 1});

//         });
//     });

//     // UPDATE THE COURSE
//     //데이터를 먼저 찾은 후 save() 메소드를 통해서 수정.
//     app.put('/api/courses/:course_id', function(req, res){
//         Course.findById(req,params.course_id,function(err,course){
//             if(err) return res.status(500).json({error:'database failure'});
//             if(!course) return res.status(404).json({error:'course not found'});

//             if(req.body.title) course.title = req.body.title;
//             if(req.body.day) course.day = req.body.day;
//             if(req.body.start_time) course.start_time = req.body.start_time;

//             course.save(function(err){
//                 if(err) res.status(500).json({error:'failed to update'});
//                 res.json({message:'course updated'});
//             });
//         });
//     });

//     // DELETE Course
//     app.delete('/api/courses/:course_id', function(req, res){
//         Course.remove({_id:req.params.course_id}, function(err,output){
//           if(err) return res.status(500).json({error:"database failure"});

//           res.status(204).end();
//           //요청한 작업을 수행했고, 데이터를 반환할 필요가 없다는 것을 의미.
//         })
//     });

// }