import { DataSource } from 'typeorm';
import { Question } from '../../entities/question.entity';
import { OldSelfStory, QuestionGroup } from '../../common/enums/user.enum';

export class QuestionSeeder {
  constructor(private readonly dataSource: DataSource) {}

  async run() {
    const questionRepository = this.dataSource.getRepository(Question);

    // Truncate the questions table before seeding
    await questionRepository.query(`TRUNCATE TABLE questions CASCADE`);
    console.log('✅ Questions table truncated successfully');

    const questions = [
      // Group 1
      {
        question: 'I often over-compensate in my life',
        group: QuestionGroup.GROUP_1,
        category: OldSelfStory.WORTHLESSNESS,
        isActive: true,
      },
      {
        question: 'I often plays it safe in my life',
        group: QuestionGroup.GROUP_1,
        category: OldSelfStory.REJECTION,
        isActive: true,
      },
      {
        question: 'I often disengage in my life',
        group: QuestionGroup.GROUP_1,
        category: OldSelfStory.ABANDONMENT,
        isActive: true,
      },
      {
        question: 'I often sabotage things in my life',
        group: QuestionGroup.GROUP_1,
        category: OldSelfStory.ABUSE,
        isActive: true,
      },

      // Group 2
      {
        question: 'I need affirmation from others',
        group: QuestionGroup.GROUP_2,
        category: OldSelfStory.WORTHLESSNESS,
        isActive: true,
      },
      {
        question: 'I need to be accurate around others',
        group: QuestionGroup.GROUP_2,
        category: OldSelfStory.REJECTION,
        isActive: true,
      },
      {
        question: 'I need to get along with others',
        group: QuestionGroup.GROUP_2,
        category: OldSelfStory.ABANDONMENT,
        isActive: true,
      },
      {
        question: 'I need to achieve in the midst of other',
        group: QuestionGroup.GROUP_2,
        category: OldSelfStory.ABUSE,
        isActive: true,
      },

      // Group 3
      {
        question: 'I have difficulty relaxing around others',
        group: QuestionGroup.GROUP_3,
        category: OldSelfStory.WORTHLESSNESS,
        isActive: true,
      },
      {
        question: 'I have difficulty trusting others',
        group: QuestionGroup.GROUP_3,
        category: OldSelfStory.REJECTION,
        isActive: true,
      },
      {
        question: 'I prefer being alone, during difficulties',
        group: QuestionGroup.GROUP_3,
        category: OldSelfStory.ABANDONMENT,
        isActive: true,
      },
      {
        question: 'I have difficulty feeling I am loved',
        group: QuestionGroup.GROUP_3,
        category: OldSelfStory.ABUSE,
        isActive: true,
      },

      // Group 4
      {
        question: 'I often under- estimate my worth',
        group: QuestionGroup.GROUP_4,
        category: OldSelfStory.WORTHLESSNESS,
        isActive: true,
      },
      {
        question: 'I often do just enough to get accepted',
        group: QuestionGroup.GROUP_4,
        category: OldSelfStory.REJECTION,
        isActive: true,
      },
      {
        question: 'I often detach myself from others',
        group: QuestionGroup.GROUP_4,
        category: OldSelfStory.ABANDONMENT,
        isActive: true,
      },
      {
        question: 'I often fear being wronged by others',
        group: QuestionGroup.GROUP_4,
        category: OldSelfStory.ABUSE,
        isActive: true,
      },

      // Group 5
      {
        question: 'I control situations, so I won\'t get hurt',
        group: QuestionGroup.GROUP_5,
        category: OldSelfStory.WORTHLESSNESS,
        isActive: true,
      },
      {
        question: 'I under-react and playthings down',
        group: QuestionGroup.GROUP_5,
        category: OldSelfStory.REJECTION,
        isActive: true,
      },
      {
        question: 'I have difficulty focusing and engaging',
        group: QuestionGroup.GROUP_5,
        category: OldSelfStory.ABANDONMENT,
        isActive: true,
      },
      {
        question: 'I often feel unsafe around others',
        group: QuestionGroup.GROUP_5,
        category: OldSelfStory.ABUSE,
        isActive: true,
      },

      // Group 6
      {
        question: 'I often feel inadequate and insufficient',
        group: QuestionGroup.GROUP_6,
        category: OldSelfStory.WORTHLESSNESS,
        isActive: true,
      },
      {
        question: 'I often feel unaccepted and overlooked',
        group: QuestionGroup.GROUP_6,
        category: OldSelfStory.REJECTION,
        isActive: true,
      },
      {
        question: 'I often feel alone and disconnected',
        group: QuestionGroup.GROUP_6,
        category: OldSelfStory.ABANDONMENT,
        isActive: true,
      },
      {
        question: 'I often feel wronged and mistreated',
        group: QuestionGroup.GROUP_6,
        category: OldSelfStory.ABUSE,
        isActive: true,
      },

      // Group 7
      {
        question: 'I often devalue myself and diminish my true feelings',
        group: QuestionGroup.GROUP_7,
        category: OldSelfStory.WORTHLESSNESS,
        isActive: true,
      },
      {
        question: 'I often settle for less and disregard my true feelings',
        group: QuestionGroup.GROUP_7,
        category: OldSelfStory.REJECTION,
        isActive: true,
      },
      {
        question: 'I often disengage, deny, and avoid my true feelings',
        group: QuestionGroup.GROUP_7,
        category: OldSelfStory.ABANDONMENT,
        isActive: true,
      },
      {
        question: 'I often get angry and misrepresent my true feelings',
        group: QuestionGroup.GROUP_7,
        category: OldSelfStory.ABUSE,
        isActive: true,
      },
    ];

    try {
      await questionRepository.save(questions);
      console.log(`✅ Seeded ${questions.length} questions successfully`);
    } catch (error) {
      console.error('❌ Error seeding questions:', error);
      throw error;
    }
  }
} 