// QR Exams Page JavaScript
var choices = ['A', 'B', 'C', 'D', 'E'];
var examId = '';
var questions = [];
var examLessons = [];
var lessonQuestions = [];
var IMAGE_BASE_URL = 'https://ogm-large-cdn.eba.gov.tr/mebi/question/image/';
var VIDEO_BASE_URL = 'https://ogm-large-cdn.eba.gov.tr/mebi/question/video/';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get exam ID from URL or dropdown
  var urlParams = new URLSearchParams(window.location.search);
  var urlExamId = urlParams.get('examId');
  if (urlExamId) {
    examId = urlExamId;
  }else {
    var examDropdown = document.getElementById('examId');
    if (examDropdown) {
      examId = examDropdown.value;
    }
  }

  if(examId !== "") {

    // set exam dropdown value
    var examDropdown = document.getElementById('examId');
    if (examDropdown) {
      examDropdown.value = examId;
    }
    // Add event listener for lesson dropdown
    document.getElementById('lessonId').addEventListener('change', function() {
      getLessonQuestions();
    });

    // Add event listener for exam dropdown
    var examDropdown = document.getElementById('examId');
    if (examDropdown) {
      examDropdown.addEventListener('change', function() {
        examId = this.value;
        // change URL without reloading
        var newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?examId=' + examId;
        window.history.pushState({path:newUrl},'',newUrl);
        questions = [];
        lessonQuestions = [];
        examLessons = [];
        getQuestions();
      });
    }

    getQuestions();
  }
});

function getQuestions() {
  var quiz = {
    ExamId: examId
  };

  console.log('Fetching questions for exam:', examId);

  fetch('https://mebi.eba.gov.tr/qr-exam-list/question-list-result', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(quiz)
  })
  .then(function(response) {
    console.log('Response status:', response.status);
    if (!response.ok) {
      throw new Error('Network response was not ok: ' + response.status);
    }
    return response.json();
  })
  .then(function(data) {
    console.log('Questions received:', data.length);
    questions = data;
    populateLessons();
    getLessonQuestions();
  })
  .catch(function(error) {
    console.error('Error fetching questions:', error);
    alert('Sınav soruları yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
  });
}

function populateLessons() {
  // Extract unique lessons from questions
  var lessonsMap = {};
  
  for (var i = 0; i < questions.length; i++) {
    var lesson = questions[i].examTemplateLessonDto;
    if (!lessonsMap[lesson.id]) {
      lessonsMap[lesson.id] = {
        id: lesson.id,
        name: lesson.name,
        rank: lesson.rank
      };
      examLessons.push(lessonsMap[lesson.id]);
    }
  }
  
  // Sort lessons by rank
  examLessons.sort(function(a, b) {
    return a.rank - b.rank;
  });
  
  // Populate the dropdown
  var lessonSelect = document.getElementById('lessonId');
  lessonSelect.innerHTML = '';
  
  for (var i = 0; i < examLessons.length; i++) {
    var option = document.createElement('option');
    option.value = examLessons[i].id;
    option.textContent = examLessons[i].name;
    if (i === 0) {
      option.selected = true;
    }
    lessonSelect.appendChild(option);
  }
  
  console.log('Lessons populated:', examLessons.length);
}

function getLessonQuestions() {
  var selectedLessonId = document.getElementById('lessonId').value;
  lessonQuestions = questions.filter(function(q) { 
    return q.examTemplateLessonDto.id === selectedLessonId; 
  });

  var lessonSubjects = [];
  var lessonOutcomes = [];

  // Build question list and analyze subjects
  for (var i = 0; i < lessonQuestions.length; i++) {
    var subjectIndex = lessonSubjects.findIndex(function(o) {
      return o.id === lessonQuestions[i].lowerSubject.id;
    });

    if (subjectIndex == -1) {
      lessonQuestions[i].lowerSubject.questionCount = 1;
      lessonSubjects.push(lessonQuestions[i].lowerSubject);
    } else {
      lessonSubjects[subjectIndex].questionCount += 1;
    }

    // Build outcomes list
    for(var j=0; j<lessonQuestions[i].questionDto.outcomes.length; j++){
      var outcome = lessonQuestions[i].questionDto.outcomes[j];

      var outcomeIndex = lessonOutcomes.findIndex(function(o) {
        return o.id === outcome.id;
      });

      if(outcomeIndex == -1){
        outcome.lessonName = lessonQuestions[i].lowerSubject.lessonName;
        outcome.gradeName = lessonQuestions[i].lowerSubject.gradeName;
        outcome.questionCount = 1;
        lessonOutcomes.push(outcome);
      } else {
        lessonOutcomes[outcomeIndex].questionCount +=1;
      }
    }
  }

  // Build question list HTML
  var c = '';
  for (var i = 0; i < lessonQuestions.length; i++) {
    c += '<tr>';
    c += '<td class="ps-4"><span class="text-dark">Soru ' + (i + 1) + '</span></td>';
    c += '<td class="text-center"><div class="d-flex justify-content-center"><span class="badge-circle bg-light text-primary border">' + choices[lessonQuestions[i].questionDto.answer] + '</span></div></td>';
    c += '<td class="text-center"><button class="btn-action-modern btn-action-view" onclick="showQuestionImage(' + i + ')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> Görüntüle</button></td>';

    if (lessonQuestions[i].questionDto.answerVideo != null) {
      c += '<td class="text-center"><button class="btn-action-modern btn-action-video" onclick="showAnswerVideo(' + i + ');"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg> İzle</button></td>';
    } else {
      c += '<td class="text-center"><span class="text-muted small">-</span></td>';
    }
    c += '</tr>';
  }

  // Build subject analysis HTML
  var s = '';
  for (var i = 0; i < lessonSubjects.length; i++) {
    s += '<tr>';
    s += '<td class="ps-4 text-dark">' + lessonSubjects[i].gradeName + '</td>';
    s += '<td><span class="badge bg-light text-dark fw-normal border">' + lessonSubjects[i].lessonName + '</span></td>';
    s += '<td class="text-dark">' + lessonSubjects[i].name + '</td>';
    s += '<td class="text-center"><span class="stats-badge">' + lessonSubjects[i].questionCount + '</span></td>';
    s += '</tr>';
  }

  // Build outcome analysis HTML
  var o = '';
  for (var i = 0; i < lessonOutcomes.length; i++) {
    o += '<tr>';
    o += '<td class="ps-4 text-dark">' + lessonOutcomes[i].gradeName + '</td>';
    o += '<td><span class="badge bg-light text-dark fw-normal border">' + lessonOutcomes[i].lessonName + '</span></td>';
    o += '<td class="text-dark">' + lessonOutcomes[i].name + '</td>';
    o += '<td class="text-center"><span class="stats-badge">' + lessonOutcomes[i].questionCount + '</span></td>';
    o += '</tr>';
  }

  // Update the tables
  document.getElementById('subjectContent').innerHTML = s;
  document.getElementById('outcomeContent').innerHTML = o;
  document.getElementById('resultContent').innerHTML = c;
  
  console.log('Lesson questions loaded:', lessonQuestions.length);
}

function showQuestionImage(i) {
  var questionImage = lessonQuestions[i].questionDto.questionImage;
  var imageUrl = IMAGE_BASE_URL + questionImage;
  
  document.getElementById('modal-question-body').innerHTML = '<img src="' + imageUrl + '" class="img-fluid" alt="Soru ' + (i + 1) + '" />';
  document.getElementById('modal-question-title').innerHTML = 'Soru ' + (i + 1);

  var modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('kt_modal_question'));
  modal.show();
}

function showAnswerVideo(i) {
  var answerVideo = lessonQuestions[i].questionDto.answerVideo;
  var videoUrl = VIDEO_BASE_URL + answerVideo;
  
  document.getElementById('modal-answer-video-body').innerHTML = '<video controls style="width:100%; height: auto;"><source src="' + videoUrl + '" type="video/mp4"></video>';
  document.getElementById('modal-answer-video-title').innerHTML = 'Soru ' + (i + 1) + ' - Cevap Videosu';

  var answerVideoModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('kt_modal_answer_video'));
  answerVideoModal.show();

  document.getElementById('kt_modal_answer_video').addEventListener('hide.bs.modal', function() {
    document.getElementById('modal-answer-video-body').innerHTML = '';
  });
}
