const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let trees = [];
let fireGroup;
let selectedTool = null;
let bucketUses = 30;
let helicopterUses = 3;
let firefighterUses = 10;
let bucketCooldown = 0;
let helicopterCooldown = 0;
let firefighterCooldown = 0;
let cursors;
let fireTimer;

function preload() {
    this.load.image('tree', 'assets/tree.png'); // зеленое дерево
    this.load.image('burnedTree', 'assets/burnedTree.png'); // черное дерево
    this.load.image('fire', 'assets/fire.png'); // огонь
    this.load.image('bucket', 'assets/bucket.png'); // ведро
    this.load.image('helicopter', 'assets/helicopter.png'); // вертолет
    this.load.image('firefighter', 'assets/firefighter.png'); // пожарники
}

function create() {
    // Создание леса
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 8; j++) {
            let tree = this.add.image(80 * i + 40, 80 * j + 40, 'tree');
            tree.setData('burned', false);
            trees.push(tree);
        }
    }

    fireGroup = this.physics.add.group();

    // Таймер пожара
    fireTimer = this.time.addEvent({
        delay: 2000,
        callback: igniteTree,
        callbackScope: this,
        loop: true
    });

    // Создание инструментов
    this.add.image(720, 50, 'bucket').setInteractive().on('pointerdown', () => selectTool('bucket'));
    this.add.image(720, 150, 'helicopter').setInteractive().on('pointerdown', () => selectTool('helicopter'));
    this.add.image(720, 250, 'firefighter').setInteractive().on('pointerdown', () => selectTool('firefighter'));

    // Событие на клик по дереву
    this.input.on('pointerdown', handleTreeClick, this);

    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    // Обновление кулдаунов
    if (bucketCooldown > 0) bucketCooldown--;
    if (helicopterCooldown > 0) helicopterCooldown--;
    if (firefighterCooldown > 0) firefighterCooldown--;
}

function igniteTree() {
    let tree = Phaser.Utils.Array.GetRandom(trees);
    if (!tree.getData('burned')) {
        tree.setTexture('burnedTree');
        let fire = fireGroup.create(tree.x, tree.y, 'fire');
        tree.setData('burned', true);
        tree.setData('fire', fire);
    }
}

function selectTool(tool) {
    selectedTool = tool;
}

function handleTreeClick(pointer) {
    let x = pointer.worldX;
    let y = pointer.worldY;

    let closestTree = null;
    let closestDistance = Infinity;

    trees.forEach(tree => {
        let distance = Phaser.Math.Distance.Between(x, y, tree.x, tree.y);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestTree = tree;
        }
    });

    if (closestTree && closestDistance < 40) {
        useToolOnTree(closestTree);
    }
}

function useToolOnTree(tree) {
    if (!tree.getData('burned')) return;

    switch (selectedTool) {
        case 'bucket':
            if (bucketUses > 0 && bucketCooldown === 0) {
                tree.setTexture('tree');
                tree.getData('fire').destroy();
                tree.setData('burned', false);
                bucketUses--;
                bucketCooldown = 20 * 60; // 20 секунд
            }
            break;
        case 'helicopter':
            if (helicopterUses > 0 && helicopterCooldown === 0) {
                for (let i = 0; i < 10; i++) {
                    let randomTree = Phaser.Utils.Array.GetRandom(trees);
                    if (randomTree.getData('burned')) {
                        randomTree.setTexture('tree');
                        randomTree.getData('fire').destroy();
                        randomTree.setData('burned', false);
                    }
                }
                helicopterUses--;
                helicopterCooldown = 60 * 60; // 60 секунд
            }
            break;
        case 'firefighter':
            if (firefighterUses > 0 && firefighterCooldown === 0) {
                for (let i = 0; i < 2; i++) {
                    let randomTree = Phaser.Utils.Array.GetRandom(trees);
                    if (randomTree.getData('burned')) {
                        randomTree.setTexture('tree');
                        randomTree.getData('fire').destroy();
                        randomTree.setData('burned', false);
                    }
                }
                firefighterUses--;
                firefighterCooldown = 50 * 60; // 50 секунд
            }
            break;
    }
}
