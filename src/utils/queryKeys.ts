const queryKeys = {
    categories: () => ['categories'] as const,
    navigationConfig: () => ['navigationConfig'] as const,
    randomSettings: () => ['randomSettings'] as const, // Добавляем ключ для рандома
}

export default queryKeys

