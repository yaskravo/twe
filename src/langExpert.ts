import type {LangPackKey} from '@lib/langPack';

// * Expert's own strings (the `Expert.*` keys of lang.ts) in the languages the fork has them in. The
// * server's packs know nothing of them, so without this every language would show their English.
const langExpert: {[langCode: string]: Partial<Record<LangPackKey, string>>} = {
  ru: {
    'Expert.Title': 'Expert',
    'Expert.Title.SearchKeywords': 'удалённые сообщения, удаленные, антиудаление, сохранённые, expert',
    'Expert.DeletedMessages': 'Удалённые сообщения',
    'Expert.SaveDeletedMessages': 'Сохранять удалённые сообщения',
    'Expert.FadeDeletedMessages': 'Приглушать удалённые',
    'Expert.SaveDeletedMessages.Caption': 'Сообщение, которое кто-то удалил, остаётся в чате с пометкой «удалено». Оно хранится только на этом устройстве и доступно лишь для чтения.',
    'Expert.ClearDeletedMessages': 'Очистить сохранённые',
    'Expert.ClearDeletedMessages.Confirm': 'Удалить с этого устройства все сохранённые удалённые сообщения? Это действие нельзя отменить.',
    'Expert.ClearDeletedMessages.Done': 'Сохранённые удалённые сообщения очищены',
    'Expert.DeletedMessage': 'удалено',
    'Expert.DeletedMessage.Date': 'Удалено: %1$s',
    'Expert.About': 'Telegram Web Expert %1$s на основе Telegram Web K. Свободное ПО под лицензией GNU GPL v3.',
    'Expert.Design': 'Оформление',
    'Expert.Design.Expert': 'Expert',
    'Expert.Design.Classic': 'Классический Telegram',
    'Expert.Design.Caption': 'Expert скругляет пузыри сообщений и кнопки и делает теплее нейтральные цвета встроенных тем.'
  },
  uk: {
    'Expert.Title': 'Expert',
    'Expert.Title.SearchKeywords': 'видалені повідомлення, антивидалення, збережені, expert',
    'Expert.DeletedMessages': 'Видалені повідомлення',
    'Expert.SaveDeletedMessages': 'Зберігати видалені повідомлення',
    'Expert.FadeDeletedMessages': 'Приглушувати видалені',
    'Expert.SaveDeletedMessages.Caption': 'Повідомлення, яке хтось видалив, залишається в чаті з позначкою «видалено». Воно зберігається лише на цьому пристрої й доступне тільки для читання.',
    'Expert.ClearDeletedMessages': 'Очистити збережені',
    'Expert.ClearDeletedMessages.Confirm': 'Видалити з цього пристрою всі збережені видалені повідомлення? Цю дію не можна скасувати.',
    'Expert.ClearDeletedMessages.Done': 'Збережені видалені повідомлення очищено',
    'Expert.DeletedMessage': 'видалено',
    'Expert.DeletedMessage.Date': 'Видалено: %1$s',
    'Expert.About': 'Telegram Web Expert %1$s на основі Telegram Web K. Вільне ПЗ за ліцензією GNU GPL v3.',
    'Expert.Design': 'Оформлення',
    'Expert.Design.Expert': 'Expert',
    'Expert.Design.Classic': 'Класичний Telegram',
    'Expert.Design.Caption': 'Expert заокруглює бульбашки повідомлень і кнопки та робить теплішими нейтральні кольори вбудованих тем.'
  },
  es: {
    'Expert.Title': 'Expert',
    'Expert.Title.SearchKeywords': 'mensajes eliminados, borrados, antiborrado, guardados, expert',
    'Expert.DeletedMessages': 'Mensajes eliminados',
    'Expert.SaveDeletedMessages': 'Guardar mensajes eliminados',
    'Expert.FadeDeletedMessages': 'Atenuar mensajes eliminados',
    'Expert.SaveDeletedMessages.Caption': 'Un mensaje que alguien elimina se queda en el chat, marcado como eliminado. Se guarda solo en este dispositivo y solo se puede leer.',
    'Expert.ClearDeletedMessages': 'Borrar copias guardadas',
    'Expert.ClearDeletedMessages.Confirm': '¿Quitar de este dispositivo todos los mensajes eliminados guardados? Esta acción no se puede deshacer.',
    'Expert.ClearDeletedMessages.Done': 'Mensajes eliminados guardados borrados',
    'Expert.DeletedMessage': 'eliminado',
    'Expert.DeletedMessage.Date': 'Eliminado: %1$s',
    'Expert.About': 'Telegram Web Expert %1$s, basado en Telegram Web K. Software libre bajo la GNU GPL v3.',
    'Expert.Design': 'Diseño',
    'Expert.Design.Expert': 'Expert',
    'Expert.Design.Classic': 'Telegram clásico',
    'Expert.Design.Caption': 'Expert redondea las burbujas de los mensajes y los botones, y da calidez a los colores neutros de los temas incluidos.'
  },
  pt: {
    'Expert.Title': 'Expert',
    'Expert.Title.SearchKeywords': 'mensagens apagadas, excluídas, antiexclusão, salvas, expert',
    'Expert.DeletedMessages': 'Mensagens apagadas',
    'Expert.SaveDeletedMessages': 'Salvar mensagens apagadas',
    'Expert.FadeDeletedMessages': 'Esmaecer mensagens apagadas',
    'Expert.SaveDeletedMessages.Caption': 'Uma mensagem que alguém apaga continua no chat, marcada como apagada. Ela fica salva apenas neste dispositivo e só pode ser lida.',
    'Expert.ClearDeletedMessages': 'Limpar cópias salvas',
    'Expert.ClearDeletedMessages.Confirm': 'Remover deste dispositivo todas as mensagens apagadas salvas? Esta ação não pode ser desfeita.',
    'Expert.ClearDeletedMessages.Done': 'Mensagens apagadas salvas removidas',
    'Expert.DeletedMessage': 'apagada',
    'Expert.DeletedMessage.Date': 'Apagada: %1$s',
    'Expert.About': 'Telegram Web Expert %1$s, baseado no Telegram Web K. Software livre sob a GNU GPL v3.',
    'Expert.Design': 'Aparência',
    'Expert.Design.Expert': 'Expert',
    'Expert.Design.Classic': 'Telegram clássico',
    'Expert.Design.Caption': 'O Expert arredonda os balões das mensagens e os botões e deixa mais quentes as cores neutras dos temas incluídos.'
  }
};

export default langExpert;
