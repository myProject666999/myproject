package database

import (
	"english-learning/models"
	"log"
	"sync"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type Store struct {
	mu            sync.RWMutex
	users         map[uint]*models.User
	userByEmail   map[string]*models.User
	userByToken   map[string]*models.User
	nextUserID    uint

	announcements map[uint]*models.Announcement
	nextAnnouncementID uint

	dailySentences map[uint]*models.DailySentence
	sentenceByDate map[string]*models.DailySentence
	nextSentenceID uint

	words         map[uint]*models.Word
	wordByWord    map[string]*models.Word
	wordsByLevel  map[string][]*models.Word
	nextWordID    uint

	userWords     map[string]*models.UserWord
	nextUserWordID uint

	listeningMaterials map[uint]*models.ListeningMaterial
	nextListeningID uint

	books         map[uint]*models.Book
	nextBookID    uint

	userBookProgress map[string]*models.UserBookProgress
	nextProgressID uint
}

var DB *Store

func InitDB() {
	DB = &Store{
		users:         make(map[uint]*models.User),
		userByEmail:   make(map[string]*models.User),
		userByToken:   make(map[string]*models.User),
		nextUserID:    1,

		announcements: make(map[uint]*models.Announcement),
		nextAnnouncementID: 1,

		dailySentences: make(map[uint]*models.DailySentence),
		sentenceByDate: make(map[string]*models.DailySentence),
		nextSentenceID: 1,

		words:         make(map[uint]*models.Word),
		wordByWord:    make(map[string]*models.Word),
		wordsByLevel:  make(map[string][]*models.Word),
		nextWordID:    1,

		userWords:     make(map[string]*models.UserWord),
		nextUserWordID: 1,

		listeningMaterials: make(map[uint]*models.ListeningMaterial),
		nextListeningID: 1,

		books:         make(map[uint]*models.Book),
		nextBookID:    1,

		userBookProgress: make(map[string]*models.UserBookProgress),
		nextProgressID: 1,
	}

	seedData()
}

func (s *Store) CreateUser(user *models.User) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.userByEmail[user.Email]; exists {
		return ErrDuplicate
	}

	user.ID = s.nextUserID
	s.nextUserID++
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

	s.users[user.ID] = user
	s.userByEmail[user.Email] = user
	if user.ActivationToken != "" {
		s.userByToken[user.ActivationToken] = user
	}

	return nil
}

func (s *Store) GetUserByEmail(email string) (*models.User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	user, exists := s.userByEmail[email]
	if !exists {
		return nil, ErrNotFound
	}
	return user, nil
}

func (s *Store) GetUserByID(id uint) (*models.User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	user, exists := s.users[id]
	if !exists {
		return nil, ErrNotFound
	}
	return user, nil
}

func (s *Store) GetUserByToken(token string) (*models.User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	user, exists := s.userByToken[token]
	if !exists {
		return nil, ErrNotFound
	}
	return user, nil
}

func (s *Store) SaveUser(user *models.User) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	oldUser, exists := s.users[user.ID]
	if !exists {
		return ErrNotFound
	}

	if oldUser.Email != user.Email {
		delete(s.userByEmail, oldUser.Email)
		s.userByEmail[user.Email] = user
	}

	if oldUser.ActivationToken != user.ActivationToken {
		if oldUser.ActivationToken != "" {
			delete(s.userByToken, oldUser.ActivationToken)
		}
		if user.ActivationToken != "" {
			s.userByToken[user.ActivationToken] = user
		}
	}

	user.UpdatedAt = time.Now()
	s.users[user.ID] = user

	return nil
}

func (s *Store) GetAllUsers() []*models.User {
	s.mu.RLock()
	defer s.mu.RUnlock()

	users := make([]*models.User, 0, len(s.users))
	for _, user := range s.users {
		users = append(users, user)
	}
	return users
}

func (s *Store) DeleteUser(id uint) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	user, exists := s.users[id]
	if !exists {
		return ErrNotFound
	}

	delete(s.users, id)
	delete(s.userByEmail, user.Email)
	if user.ActivationToken != "" {
		delete(s.userByToken, user.ActivationToken)
	}

	return nil
}

func (s *Store) CountUsers() int64 {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return int64(len(s.users))
}

func (s *Store) CountActiveUsers() int64 {
	s.mu.RLock()
	defer s.mu.RUnlock()

	count := 0
	for _, user := range s.users {
		if user.IsActive {
			count++
		}
	}
	return int64(count)
}

func (s *Store) CreateAnnouncement(announcement *models.Announcement) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	announcement.ID = s.nextAnnouncementID
	s.nextAnnouncementID++
	announcement.CreatedAt = time.Now()
	announcement.UpdatedAt = time.Now()

	s.announcements[announcement.ID] = announcement
	return nil
}

func (s *Store) GetAllAnnouncements() []*models.Announcement {
	s.mu.RLock()
	defer s.mu.RUnlock()

	anns := make([]*models.Announcement, 0, len(s.announcements))
	for _, ann := range s.announcements {
		anns = append(anns, ann)
	}

	for i := range anns {
		for j := i + 1; j < len(anns); j++ {
			if anns[i].CreatedAt.Before(anns[j].CreatedAt) {
				anns[i], anns[j] = anns[j], anns[i]
			}
		}
	}

	return anns
}

func (s *Store) GetLatestAnnouncements(limit int) []*models.Announcement {
	all := s.GetAllAnnouncements()
	if len(all) > limit {
		return all[:limit]
	}
	return all
}

func (s *Store) GetAnnouncementByID(id uint) (*models.Announcement, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	ann, exists := s.announcements[id]
	if !exists {
		return nil, ErrNotFound
	}
	return ann, nil
}

func (s *Store) SaveAnnouncement(announcement *models.Announcement) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	_, exists := s.announcements[announcement.ID]
	if !exists {
		return ErrNotFound
	}

	announcement.UpdatedAt = time.Now()
	s.announcements[announcement.ID] = announcement
	return nil
}

func (s *Store) DeleteAnnouncement(id uint) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	_, exists := s.announcements[id]
	if !exists {
		return ErrNotFound
	}

	delete(s.announcements, id)
	return nil
}

func (s *Store) CountAnnouncements() int64 {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return int64(len(s.announcements))
}

func (s *Store) CreateDailySentence(sentence *models.DailySentence) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.sentenceByDate[sentence.Date]; exists {
		return ErrDuplicate
	}

	sentence.ID = s.nextSentenceID
	s.nextSentenceID++

	s.dailySentences[sentence.ID] = sentence
	s.sentenceByDate[sentence.Date] = sentence
	return nil
}

func (s *Store) GetAllDailySentences() []*models.DailySentence {
	s.mu.RLock()
	defer s.mu.RUnlock()

	sentences := make([]*models.DailySentence, 0, len(s.dailySentences))
	for _, s := range s.dailySentences {
		sentences = append(sentences, s)
	}
	return sentences
}

func (s *Store) CreateWord(word *models.Word) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.wordByWord[word.Word]; exists {
		return ErrDuplicate
	}

	word.ID = s.nextWordID
	s.nextWordID++

	s.words[word.ID] = word
	s.wordByWord[word.Word] = word
	s.wordsByLevel[word.Level] = append(s.wordsByLevel[word.Level], word)

	return nil
}

func (s *Store) GetAllWords() []*models.Word {
	s.mu.RLock()
	defer s.mu.RUnlock()

	words := make([]*models.Word, 0, len(s.words))
	for _, w := range s.words {
		words = append(words, w)
	}
	return words
}

func (s *Store) GetWordsByLevel(level string) []*models.Word {
	s.mu.RLock()
	defer s.mu.RUnlock()

	words := make([]*models.Word, len(s.wordsByLevel[level]))
	copy(words, s.wordsByLevel[level])
	return words
}

func (s *Store) GetWordByID(id uint) (*models.Word, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	word, exists := s.words[id]
	if !exists {
		return nil, ErrNotFound
	}
	return word, nil
}

func (s *Store) SaveWord(word *models.Word) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	oldWord, exists := s.words[word.ID]
	if !exists {
		return ErrNotFound
	}

	if oldWord.Word != word.Word {
		delete(s.wordByWord, oldWord.Word)
		s.wordByWord[word.Word] = word
	}

	if oldWord.Level != word.Level {
		for i, w := range s.wordsByLevel[oldWord.Level] {
			if w.ID == oldWord.ID {
				s.wordsByLevel[oldWord.Level] = append(s.wordsByLevel[oldWord.Level][:i], s.wordsByLevel[oldWord.Level][i+1:]...)
				break
			}
		}
		s.wordsByLevel[word.Level] = append(s.wordsByLevel[word.Level], word)
	}

	s.words[word.ID] = word
	return nil
}

func (s *Store) DeleteWord(id uint) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	word, exists := s.words[id]
	if !exists {
		return ErrNotFound
	}

	delete(s.words, id)
	delete(s.wordByWord, word.Word)

	for i, w := range s.wordsByLevel[word.Level] {
		if w.ID == word.ID {
			s.wordsByLevel[word.Level] = append(s.wordsByLevel[word.Level][:i], s.wordsByLevel[word.Level][i+1:]...)
			break
		}
	}

	return nil
}

func (s *Store) CountWords() int64 {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return int64(len(s.words))
}

func (s *Store) CountWordsByLevel(level string) int64 {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return int64(len(s.wordsByLevel[level]))
}

func (s *Store) GetOrCreateUserWord(userID, wordID uint) *models.UserWord {
	s.mu.Lock()
	defer s.mu.Unlock()

	key := getKey(userID, wordID)
	uw, exists := s.userWords[key]
	if !exists {
		uw = &models.UserWord{
			ID:        s.nextUserWordID,
			UserID:    userID,
			WordID:    wordID,
			CreatedAt: time.Now(),
		}
		s.nextUserWordID++
		s.userWords[key] = uw
	}
	return uw
}

func (s *Store) SaveUserWord(uw *models.UserWord) {
	s.mu.Lock()
	defer s.mu.Unlock()

	key := getKey(uw.UserID, uw.WordID)
	uw.UpdatedAt = time.Now()
	s.userWords[key] = uw
}

func (s *Store) GetUserWord(userID, wordID uint) *models.UserWord {
	s.mu.RLock()
	defer s.mu.RUnlock()

	key := getKey(userID, wordID)
	uw, exists := s.userWords[key]
	if !exists {
		return &models.UserWord{}
	}
	return uw
}

func (s *Store) GetLearnedWordIDs(userID uint) []uint {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var ids []uint
	for _, uw := range s.userWords {
		if uw.UserID == userID && uw.IsLearned {
			ids = append(ids, uw.WordID)
		}
	}
	return ids
}

func (s *Store) GetFavoriteWords(userID uint) []*models.Word {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var words []*models.Word
	for _, uw := range s.userWords {
		if uw.UserID == userID && uw.IsFavorited {
			if word, exists := s.words[uw.WordID]; exists {
				words = append(words, word)
			}
		}
	}
	return words
}

func (s *Store) CountLearnedWordsByLevel(userID uint, level string) int64 {
	s.mu.RLock()
	defer s.mu.RUnlock()

	count := 0
	for _, uw := range s.userWords {
		if uw.UserID == userID && uw.IsLearned {
			if word, exists := s.words[uw.WordID]; exists && word.Level == level {
				count++
			}
		}
	}
	return int64(count)
}

func (s *Store) CreateListeningMaterial(m *models.ListeningMaterial) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	m.ID = s.nextListeningID
	s.nextListeningID++
	m.CreatedAt = time.Now()

	s.listeningMaterials[m.ID] = m
	return nil
}

func (s *Store) GetAllListeningMaterials() []*models.ListeningMaterial {
	s.mu.RLock()
	defer s.mu.RUnlock()

	materials := make([]*models.ListeningMaterial, 0, len(s.listeningMaterials))
	for _, m := range s.listeningMaterials {
		materials = append(materials, m)
	}
	return materials
}

func (s *Store) GetListeningMaterials(level string, year int) []*models.ListeningMaterial {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var materials []*models.ListeningMaterial
	for _, m := range s.listeningMaterials {
		if (level == "" || m.Level == level) && (year == 0 || m.Year == year) {
			materials = append(materials, m)
		}
	}
	return materials
}

func (s *Store) GetListeningMaterialByID(id uint) (*models.ListeningMaterial, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	m, exists := s.listeningMaterials[id]
	if !exists {
		return nil, ErrNotFound
	}
	return m, nil
}

func (s *Store) CreateBook(book *models.Book) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	book.ID = s.nextBookID
	s.nextBookID++

	s.books[book.ID] = book
	return nil
}

func (s *Store) GetAllBooks() []*models.Book {
	s.mu.RLock()
	defer s.mu.RUnlock()

	books := make([]*models.Book, 0, len(s.books))
	for _, b := range s.books {
		books = append(books, b)
	}
	return books
}

func (s *Store) GetBookByID(id uint) (*models.Book, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	book, exists := s.books[id]
	if !exists {
		return nil, ErrNotFound
	}
	return book, nil
}

func (s *Store) SaveBook(book *models.Book) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	_, exists := s.books[book.ID]
	if !exists {
		return ErrNotFound
	}

	s.books[book.ID] = book
	return nil
}

func (s *Store) DeleteBook(id uint) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	_, exists := s.books[id]
	if !exists {
		return ErrNotFound
	}

	delete(s.books, id)
	return nil
}

func (s *Store) CountBooks() int64 {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return int64(len(s.books))
}

func (s *Store) GetOrCreateUserBookProgress(userID, bookID uint) *models.UserBookProgress {
	s.mu.Lock()
	defer s.mu.Unlock()

	key := getKey(userID, bookID)
	progress, exists := s.userBookProgress[key]
	if !exists {
		progress = &models.UserBookProgress{
			ID:     s.nextProgressID,
			UserID: userID,
			BookID: bookID,
		}
		s.nextProgressID++
		s.userBookProgress[key] = progress
	}
	return progress
}

func (s *Store) SaveUserBookProgress(progress *models.UserBookProgress) {
	s.mu.Lock()
	defer s.mu.Unlock()

	key := getKey(progress.UserID, progress.BookID)
	progress.UpdatedAt = time.Now()
	s.userBookProgress[key] = progress
}

func (s *Store) GetUserBookProgresses(userID uint) []*models.UserBookProgress {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var progresses []*models.UserBookProgress
	for _, p := range s.userBookProgress {
		if p.UserID == userID {
			progresses = append(progresses, p)
		}
	}
	return progresses
}

var (
	ErrNotFound  = &storeError{"not found"}
	ErrDuplicate = &storeError{"duplicate entry"}
)

type storeError struct {
	msg string
}

func (e *storeError) Error() string { return e.msg }

func getKey(a, b uint) string {
	return string(rune(a)) + "-" + string(rune(b))
}

func seedData() {
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	admin := &models.User{
		Email:    "admin@example.com",
		Password: string(hashedPassword),
		Name:     "管理员",
		Role:     "admin",
		IsActive: true,
	}
	DB.CreateUser(admin)
	log.Println("Admin user created: admin@example.com / admin123")

	words := []*models.Word{
		{Word: "abandon", Meaning: "放弃", Level: "cet4", Example: "He abandoned his car.", ExampleCN: "他放弃了他的车。", Pronunciation: "/əˈbændən/"},
		{Word: "ability", Meaning: "能力", Level: "cet4", Example: "She has the ability to succeed.", ExampleCN: "她有成功的能力。", Pronunciation: "/əˈbɪləti/"},
		{Word: "above", Meaning: "在...上方", Level: "cet4", Example: "The plane is above the clouds.", ExampleCN: "飞机在云层上方。", Pronunciation: "/əˈbʌv/"},
		{Word: "absolute", Meaning: "绝对的", Level: "cet4", Example: "It was an absolute disaster.", ExampleCN: "这是一场彻头彻尾的灾难。", Pronunciation: "/ˈæbsəluːt/"},
		{Word: "accept", Meaning: "接受", Level: "cet4", Example: "I accept your apology.", ExampleCN: "我接受你的道歉。", Pronunciation: "/əkˈsept/"},
		{Word: "achieve", Meaning: "实现", Level: "cet4", Example: "She achieved her goals.", ExampleCN: "她实现了她的目标。", Pronunciation: "/əˈtʃiːv/"},
		{Word: "analyze", Meaning: "分析", Level: "cet4", Example: "We need to analyze the data.", ExampleCN: "我们需要分析数据。", Pronunciation: "/ˈænəlaɪz/"},
		{Word: "approach", Meaning: "方法；接近", Level: "cet4", Example: "Try a different approach.", ExampleCN: "尝试不同的方法。", Pronunciation: "/əˈproʊtʃ/"},
		{Word: "appropriate", Meaning: "适当的", Level: "cet4", Example: "That is not appropriate.", ExampleCN: "那是不适当的。", Pronunciation: "/əˈproʊpriət/"},
		{Word: "acquire", Meaning: "获得", Level: "cet6", Example: "He acquired a new skill.", ExampleCN: "他获得了一项新技能。", Pronunciation: "/əˈkwaɪər/"},
		{Word: "adequate", Meaning: "足够的", Level: "cet6", Example: "The resources are adequate.", ExampleCN: "资源是足够的。", Pronunciation: "/ˈædɪkwət/"},
		{Word: "advocate", Meaning: "提倡", Level: "cet6", Example: "She advocates for change.", ExampleCN: "她提倡变革。", Pronunciation: "/ˈædvəkeɪt/"},
		{Word: "aggressive", Meaning: "积极进取的", Level: "cet6", Example: "He is aggressive in business.", ExampleCN: "他在商业上很积极进取。", Pronunciation: "/əˈɡresɪv/"},
		{Word: "ambiguous", Meaning: "模糊的", Level: "cet6", Example: "The statement was ambiguous.", ExampleCN: "这个声明是模糊的。", Pronunciation: "/æmˈbɪɡjuəs/"},
		{Word: "amplify", Meaning: "放大", Level: "cet6", Example: "They amplified the sound.", ExampleCN: "他们放大了声音。", Pronunciation: "/ˈæmplɪfaɪ/"},
	}
	for _, w := range words {
		DB.CreateWord(w)
	}
	log.Println("Seed words created")

	sentences := []*models.DailySentence{
		{Sentence: "The only way to do great work is to love what you do.", Translation: "做出伟大工作的唯一方法就是热爱你所做的事情。", Date: "2026-05-01"},
		{Sentence: "Stay hungry, stay foolish.", Translation: "求知若饥，虚心若愚。", Date: "2026-05-02"},
		{Sentence: "Life is what happens when you're busy making other plans.", Translation: "生活就是当你忙于制定其他计划时发生的事情。", Date: "2026-05-03"},
		{Sentence: "The future belongs to those who believe in the beauty of their dreams.", Translation: "未来属于那些相信自己梦想之美的人。", Date: "2026-05-04"},
		{Sentence: "It does not matter how slowly you go as long as you do not stop.", Translation: "重要的不是你走得有多慢，而是你不要停止。", Date: "2026-05-05"},
		{Sentence: "In the middle of difficulty lies opportunity.", Translation: "困难之中蕴藏着机遇。", Date: "2026-05-06"},
		{Sentence: "Success is not final, failure is not fatal: it is the courage to continue that counts.", Translation: "成功不是终点，失败也不是致命的：重要的是继续前进的勇气。", Date: "2026-05-07"},
		{Sentence: "The best time to plant a tree was 20 years ago. The second best time is now.", Translation: "种树的最佳时间是20年前，其次是现在。", Date: "2026-05-08"},
		{Sentence: "Believe you can and you're halfway there.", Translation: "相信你能做到，你就已经成功了一半。", Date: "2026-05-09"},
		{Sentence: "Act as if what you do makes a difference. It does.", Translation: "表现得好像你的所作所为很重要，确实如此。", Date: "2026-05-10"},
	}
	for _, s := range sentences {
		DB.CreateDailySentence(s)
	}
	log.Println("Seed sentences created")

	books := []*models.Book{
		{
			Title:       "Alice's Adventures in Wonderland",
			Author:      "Lewis Carroll",
			Description: "Alice falls down a rabbit hole into a fantasy world.",
			Level:       "beginner",
			Content:     "CHAPTER I. Down the Rabbit-Hole\n\nAlice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice 'without pictures or conversations?'\n\nSo she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.",
		},
		{
			Title:       "The Little Prince",
			Author:      "Antoine de Saint-Exupéry",
			Description: "A pilot stranded in the desert meets a young prince.",
			Level:       "intermediate",
			Content:     "I ask the indulgence of the children who may read this book for dedicating it to a grown-up. I have a serious reason: he is the best friend I have in the world. I have another reason: this grown-up understands everything, even books about children. I have a third reason: he lives in France where he is hungry and cold. He needs cheering up. If all these reasons are not enough, I will dedicate the book to the child from whom this grown-up grew. All grown-ups were once children— although few of them remember it.",
		},
		{
			Title:       "Pride and Prejudice",
			Author:      "Jane Austen",
			Description: "A classic novel of manners, love, and marriage.",
			Level:       "advanced",
			Content:     "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.\n\nHowever little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters.",
		},
	}
	for _, b := range books {
		DB.CreateBook(b)
	}
	log.Println("Seed books created")

	listeningMaterials := []*models.ListeningMaterial{
		{
			Title:      "CET4 Listening - 2023",
			Level:      "cet4",
			Year:       2023,
			Transcript: "W: Good morning, sir. How can I help you?\nM: I'd like to book a room for two nights.\nW: Certainly, sir. Would you like a single room or a double room?\nM: A double room, please.\nW: Let me check... We have a double room available for the 15th and 16th. The rate is $120 per night.\nM: That's fine. I'll take it.",
			Questions:  "1. Where does this conversation most probably take place?\nA) At a hotel.\nB) At an airport.\nC) At a restaurant.\nD) At a hospital.",
			Answers:    "1. A",
		},
		{
			Title:      "CET4 Listening - 2022",
			Level:      "cet4",
			Year:       2022,
			Transcript: "M: Excuse me, could you tell me how to get to the railway station?\nW: Sure. Go straight down this street for two blocks, then turn right. You'll see it on your left.\nM: Is it far from here?\nW: No, it's only a ten-minute walk.",
			Questions:  "1. What is the man doing?\nA) Looking for a hotel.\nB) Asking for directions.\nC) Buying a train ticket.\nD) Waiting for a bus.",
			Answers:    "1. B",
		},
		{
			Title:      "CET6 Listening - 2023",
			Level:      "cet6",
			Year:       2023,
			Transcript: "W: Professor Smith, I'm having trouble with the research paper you assigned. I'm not sure where to start.\nM: Don't worry, Lisa. The key is to narrow down your topic. What aspect of climate change are you most interested in?\nW: I've been reading about the impact on ocean ecosystems. It's fascinating but there's so much information.\nM: That's a good start. Focus on one specific ecosystem, like coral reefs, and find recent studies. I can recommend some journals.",
			Questions:  "1. What is the woman's problem?\nA) She doesn't understand the assignment.\nB) She can't decide on a research topic.\nC) She needs help narrowing her research focus.\nD) She can't find enough information.",
			Answers:    "1. C",
		},
	}
	for _, m := range listeningMaterials {
		DB.CreateListeningMaterial(m)
	}
	log.Println("Seed listening materials created")

	announcements := []*models.Announcement{
		{
			Title:    "欢迎使用英语学习管理系统",
			Content:  "欢迎使用英语学习管理系统！本系统提供单词学习、听力练习、阅读书籍等多种功能。祝您学习愉快！",
			AuthorID: 1,
		},
		{
			Title:    "新功能上线：每日一句",
			Content:  "每日一句功能已上线！每天为您展示一句英语名言及其翻译，配合必应每日一图，让学习更有乐趣。",
			AuthorID: 1,
		},
		{
			Title:    "系统维护通知",
			Content:  "系统将于每周日凌晨2:00-4:00进行例行维护，届时可能出现短暂的服务中断，敬请谅解。",
			AuthorID: 1,
		},
	}
	for _, a := range announcements {
		DB.CreateAnnouncement(a)
	}
	log.Println("Seed announcements created")
}
