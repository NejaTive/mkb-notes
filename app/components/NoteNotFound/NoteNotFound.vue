<template>
  <div class="not-found">
    <StickerPaper color="pink" :tilt="-2" class="missing">
      <h1 class="missing__title">Заметка не найдена</h1>
      <p class="missing__text">Возможно, её удалили или ссылка неверна. Проверьте адрес или вернитесь на доску.</p>
      <div class="missing__actions">
        <BaseButton to="/" icon="back">На доску</BaseButton>
        <BaseButton to="/notes/new" variant="primary" icon="plus">Новая заметка</BaseButton>
      </div>
    </StickerPaper>
  </div>
</template>

<style scoped lang="scss" src="./NoteNotFound.scss"></style>
