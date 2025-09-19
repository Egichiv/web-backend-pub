import { PrismaClient, Genre } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Начинаем заполнение базы данных...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        nickname: 'admin',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        nickname: 'johnDoe',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        nickname: 'mememaster',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        nickname: 'quotelover',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        nickname: 'blogger',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        nickname: 'commenter',
        password: hashedPassword,
      },
    }),
  ]);

  const posts = await Promise.all([
    prisma.post.create({
      data: {
        heading: 'Добро пожаловать в наш блог!',
        text: 'Это первый пост в нашем новом блоге. Здесь мы будем делиться интересными мыслями, цитатами и мемами.',
        userId: users[0].id, // admin
      },
    }),
    prisma.post.create({
      data: {
        heading: 'О важности позитивного мышления',
        text: 'Позитивное мышление может кардинально изменить вашу жизнь. В этом посте мы рассмотрим основные принципы позитивного подхода к жизни.',
        userId: users[4].id, // blogger
      },
    }),
    prisma.post.create({
      data: {
        heading: 'Топ-10 лучших цитат о жизни',
        text: 'Собрали для вас самые вдохновляющие цитаты о жизни от великих людей. Каждая из них может стать вашим девизом.',
        userId: users[3].id, // quotelover
      },
    }),
    prisma.post.create({
      data: {
        heading: 'Как юмор помогает в трудных ситуациях',
        text: 'Юмор - это мощное оружие против стресса и негативных эмоций. Расскажем, как правильно использовать смех в повседневной жизни.',
        userId: users[2].id, // mememaster
      },
    }),
    prisma.post.create({
      data: {
        heading: 'Мемы как новая форма искусства',
        text: 'В эпоху интернета мемы стали неотъемлемой частью культуры. Это новый язык общения и способ выражения мыслей.',
        userId: users[2].id, // mememaster
      },
    }),
  ]);

  const quotes = await Promise.all([
    prisma.quote.create({
      data: {
        author: 'Альберт Эйнштейн',
        text: 'Логика может привести вас от пункта А к пункту Б, а воображение — куда угодно.',
        genre: Genre.SMART,
        userId: users[0].id,
        uploadedAt: new Date('2024-01-15'),
      },
    }),
    prisma.quote.create({
      data: {
        author: 'Уолт Дисней',
        text: 'Все ваши мечты могут стать реальностью, если у вас хватит смелости их преследовать.',
        genre: Genre.MOTIVATING,
        userId: users[1].id,
        uploadedAt: new Date('2024-01-16'),
      },
    }),
    prisma.quote.create({
      data: {
        author: 'Стив Джобс',
        text: 'Инновации отличают лидера от последователя.',
        genre: Genre.SMART,
        userId: users[3].id,
        uploadedAt: new Date('2024-01-17'),
      },
    }),
    prisma.quote.create({
      data: {
        author: 'Марк Твен',
        text: 'Доброта — это язык, который глухой может услышать, а слепой может увидеть.',
        genre: Genre.SMART,
        userId: users[2].id,
        uploadedAt: new Date('2024-01-18'),
      },
    }),
    prisma.quote.create({
      data: {
        author: 'Конфуций',
        text: 'Не важно, насколько медленно вы идёте, до тех пор, пока вы не останавливаетесь.',
        genre: Genre.MOTIVATING,
        userId: users[4].id,
        uploadedAt: new Date('2024-01-19'),
      },
    }),
    prisma.quote.create({
      data: {
        author: 'Оскар Уайльд',
        text: 'Опыт — просто название, которое мы даём своим ошибкам.',
        genre: Genre.REALISTIC,
        userId: users[0].id,
        uploadedAt: new Date('2024-01-20'),
      },
    }),
    prisma.quote.create({
      data: {
        author: 'Граучо Маркс',
        text: 'За пределами собаки книга — лучший друг человека. Внутри собаки читать слишком темно.',
        genre: Genre.FUNNY,
        userId: users[2].id,
        uploadedAt: new Date('2024-01-21'),
      },
    }),
    prisma.quote.create({
      data: {
        author: 'Винстон Черчилль',
        text: 'Успех — это способность переходить от одной неудачи к другой, не теряя энтузиазма.',
        genre: Genre.MOTIVATING,
        userId: users[1].id,
        uploadedAt: new Date('2024-01-22'),
      },
    }),
    prisma.quote.create({
      data: {
        author: 'Вуди Аллен',
        text: 'Деньги лучше бедности, если не по другим причинам, то хотя бы по финансовым.',
        genre: Genre.FUNNY,
        userId: users[5].id,
        uploadedAt: new Date('2024-01-23'),
      },
    }),
    prisma.quote.create({
      data: {
        author: 'Генри Форд',
        text: 'Препятствия — это те страшные вещи, которые вы видите, когда отводите глаза от своей цели.',
        genre: Genre.REALISTIC,
        userId: users[3].id,
        uploadedAt: new Date('2024-01-24'),
      },
    }),
  ]);

  const memes = await Promise.all([
    prisma.meme.create({
      data: {
        link: 'https://i.imgur.com/example1.jpg',
        userId: users[2].id,
      },
    }),
    prisma.meme.create({
      data: {
        link: 'https://i.imgur.com/example2.jpg',
        userId: users[1].id,
      },
    }),
    prisma.meme.create({
      data: {
        link: 'https://i.imgur.com/example3.jpg',
        userId: users[2].id,
      },
    }),
    prisma.meme.create({
      data: {
        link: 'https://i.imgur.com/example4.jpg',
        userId: users[4].id,
      },
    }),
    prisma.meme.create({
      data: {
        link: 'https://i.imgur.com/example5.jpg',
        userId: users[0].id,
      },
    }),
    prisma.meme.create({
      data: {
        link: 'https://i.imgur.com/example6.jpg',
        userId: users[5].id,
      },
    }),
    prisma.meme.create({
      data: {
        link: 'https://i.imgur.com/example7.jpg',
        userId: users[2].id,
      },
    }),
    prisma.meme.create({
      data: {
        link: 'https://i.imgur.com/example8.jpg',
        userId: users[3].id,
      },
    }),
  ]);

  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        text: 'Отличный пост! Очень полезная информация.',
        userId: users[1].id,
        createdAt: new Date('2024-01-16T10:30:00Z'),
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Согласен с автором. Позитивное мышление действительно работает!',
        userId: users[2].id,
        createdAt: new Date('2024-01-16T11:15:00Z'),
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Интересная подборка цитат. Особенно понравилась цитата Эйнштейна.',
        userId: users[3].id,
        createdAt: new Date('2024-01-17T09:45:00Z'),
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Хaha, мемы действительно стали частью нашей культуры 😄',
        userId: users[4].id,
        createdAt: new Date('2024-01-17T14:20:00Z'),
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Спасибо за мотивацию! Как раз то, что нужно было сегодня прочитать.',
        userId: users[5].id,
        createdAt: new Date('2024-01-18T08:00:00Z'),
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Юмор - это действительно лучшее лекарство от стресса.',
        userId: users[0].id,
        createdAt: new Date('2024-01-18T16:30:00Z'),
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Добавлю этот блог в закладки. Интересный контент!',
        userId: users[1].id,
        createdAt: new Date('2024-01-19T12:45:00Z'),
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Было бы здорово увидеть больше статей на тему саморазвития.',
        userId: users[4].id,
        createdAt: new Date('2024-01-19T15:10:00Z'),
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Цитата Марка Твена просто золотая! Очень глубокая мысль.',
        userId: users[2].id,
        createdAt: new Date('2024-01-20T11:30:00Z'),
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Ждём новых постов и интересных материалов!',
        userId: users[5].id,
        createdAt: new Date('2024-01-20T18:45:00Z'),
      },
    }),
  ]);

  console.log('База данных успешно заполнена тестовыми данными!');
  console.log(`Создано: ${users.length} пользователей`);
  console.log(`Создано: ${posts.length} постов`);
  console.log(`Создано: ${quotes.length} цитат`);
  console.log(`Создано: ${memes.length} мемов`);
  console.log(`Создано: ${comments.length} комментариев`);

  console.log('\nТестовые аккаунты (пароль для всех: password123):');
  console.log('admin');
  console.log('johnDoe');
  console.log('mememaster');
  console.log('quotelover');
  console.log('blogger');
  console.log('commenter');
}

main()
  .catch((e) => {
    console.error('Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });