<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const is404 = computed(() => props.error.statusCode === 404)

useHead({ title: () => (is404.value ? 'Страница не найдена' : 'Ошибка') })
</script>

<template>
  <main class="error-page">
    <BoardFrame />
    <StickerPaper color="pink" :tilt="-2" class="error-page__paper">
      <p class="error-page__code">{{ error.statusCode }}</p>
      <h1 class="error-page__title">{{ is404 ? 'Такой страницы нет' : 'Что-то пошло не так' }}</h1>
      <p class="error-page__text">
        {{ is404 ? 'Похоже, этот стикер отклеился и упал за доску.' : error.message }}
      </p>
      <BaseButton variant="primary" icon="back" @click="clearError({ redirect: '/' })">На доску</BaseButton>
    </StickerPaper>
  </main>
</template>

<style scoped lang="scss">
.error-page {
  display: grid;
  place-items: center;
  min-height: 100dvh;
  padding: calc(var(--frame) + 16px);

  &__paper {
    width: min(100%, 380px);
  }

  &__code {
    margin: 0;
    font-family: $font-hand;
    font-size: 4rem;
    line-height: 1;
    font-weight: 700;
  }

  &__title {
    margin: 0.2rem 0;
    font-family: $font-hand;
    font-size: 2rem;
  }

  &__text {
    margin: 0 0 1.2rem;
    color: var(--ink-soft);
  }
}
</style>
