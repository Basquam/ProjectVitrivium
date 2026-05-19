"""All pre-built stories for Quest Hero app."""
from enum import Enum
from typing import List
from pydantic import BaseModel, Field
from datetime import datetime


class BeatType(str, Enum):
    INTRO = "intro"
    CHALLENGE = "challenge"
    VICTORY = "victory"
    PLOT_TWIST = "plot_twist"
    FINALE = "finale"


class StoryBeat(BaseModel):
    type: BeatType
    title: str
    text: str
    image_url: str = ""  # emoji fallback
    villain_name: str = ""
    reward_points: int = 0
    reward_badge: str = ""
    image_prompt: str = ""  # For AI image generation


class StoryAct(BaseModel):
    act_number: int
    title: str
    beats: List[StoryBeat]


class Story(BaseModel):
    id: str
    title: str
    description: str
    theme: str
    icon: str  # emoji
    color_primary: str
    color_secondary: str
    total_acts: int
    acts: List[StoryAct]
    total_points: int
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ============== WILD WEST STORY ==============
WILD_WEST_STORY = Story(
    id="wild-west-redemption",
    title="Wild West Redemption",
    description="A mysterious wanderer rides into Dusty Gulch to save it from outlaws.",
    theme="western",
    icon="🤠",
    color_primary="#d97706",
    color_secondary="#92400e",
    total_acts=3,
    total_points=300,
    acts=[
        StoryAct(act_number=1, title="Act I: Arrival at Dusty Gulch", beats=[
            StoryBeat(type=BeatType.INTRO, title="The Dusty Trail", text="🏜️ The sun beats down as you ride into Dusty Gulch. The town is quiet... too quiet. Townsfolk whisper and point. Something is very wrong here.", image_url="🌵", image_prompt="A lone cowboy rides into a dusty western frontier town at sunset, dramatic cinematic lighting"),
            StoryBeat(type=BeatType.CHALLENGE, title="Billy the Kid Appears", text="🤠 'Well, well... a stranger.' Billy the Kid steps out from the saloon. 'This town ain't safe for heroes. Face me at high noon!'", villain_name="Billy the Kid", image_url="🔫", image_prompt="Wild West villain Billy the Kid, young outlaw with revolver, menacing pose, saloon background"),
            StoryBeat(type=BeatType.VICTORY, title="Victory Over Billy", text="💥 BANG! Your draw was faster! Billy stumbles back. 'Impossible...' The townsfolk erupt in cheers!", image_url="⭐", reward_points=50, reward_badge="First Blood"),
            StoryBeat(type=BeatType.CHALLENGE, title="The Dalton Gang Strikes", text="🏦 Gunshots ring out! The Dalton Gang is robbing the bank! 'Nobody move!' shouts Grat Dalton.", villain_name="Grat Dalton", image_url="💰", image_prompt="Wild West bank robbery scene, outlaw gang with masks and guns, dramatic"),
            StoryBeat(type=BeatType.VICTORY, title="Bank Saved!", text="⚡ You burst through the bank doors! In a flurry of action, you disarm the gang! The townspeople lift you on their shoulders!", image_url="🎖️", reward_points=75, reward_badge="Bank Guardian"),
        ]),
        StoryAct(act_number=2, title="Act II: The Plot Thickens", beats=[
            StoryBeat(type=BeatType.PLOT_TWIST, title="A Dark Secret", text="🌙 That night, the sheriff reveals: 'There's someone behind all this... Black Bart. He's planning to take over the entire county tomorrow.'", image_url="🌑"),
            StoryBeat(type=BeatType.CHALLENGE, title="The Outlaw Army", text="☀️ Dawn breaks. Dozens of outlaws ride toward town! 'There's too many!' But you stand firm.", villain_name="Outlaw Army", image_url="🐎", image_prompt="Western outlaw army on horseback charging at dawn, dust clouds, cinematic"),
            StoryBeat(type=BeatType.VICTORY, title="The Defense of Dusty Gulch", text="💪 Perfect defense! Barricades, strategy, courage! The outlaws retreat in chaos!", image_url="🛡️", reward_points=75, reward_badge="Town Defender"),
        ]),
        StoryAct(act_number=3, title="Act III: High Noon Showdown", beats=[
            StoryBeat(type=BeatType.CHALLENGE, title="Black Bart's Challenge", text="🕛 High noon. Black Bart stands alone in the street. 'You've ruined everything, stranger. Winner takes the town.'", villain_name="Black Bart", image_url="💀", image_prompt="Wild West villain Black Bart, dark cowboy with black hat, scarred face, ominous, high noon showdown"),
            StoryBeat(type=BeatType.FINALE, title="LEGENDARY VICTORY!", text="🎉 DRAW! Black Bart's gun falls to the dust. The mayor pins a golden sheriff's badge on your chest. 'You're not just a hero... you're a LEGEND!' 🌟", image_url="👑", reward_points=100, reward_badge="Sheriff of the West"),
        ]),
    ]
)

# ============== SPACE MISSION STORY ==============
SPACE_MISSION_STORY = Story(
    id="space-odyssey",
    title="Space Odyssey: The Last Stand",
    description="Captain of the starship Aurora, defend humanity from alien threats across the galaxy.",
    theme="sci-fi",
    icon="🚀",
    color_primary="#7c3aed",
    color_secondary="#4c1d95",
    total_acts=3,
    total_points=300,
    acts=[
        StoryAct(act_number=1, title="Act I: Distress Signal", beats=[
            StoryBeat(type=BeatType.INTRO, title="Deep Space Awakening", text="🌌 Your starship Aurora drifts through the void when an emergency signal pierces the silence. Earth needs you, Captain.", image_url="🛸", image_prompt="A sleek starship in deep space, nebula background, cinematic sci-fi"),
            StoryBeat(type=BeatType.CHALLENGE, title="Pirate Ambush", text="⚠️ Space pirates surround your ship! Captain Vex sneers through the viewscreen: 'Hand over your cargo, or be destroyed!'", villain_name="Captain Vex", image_url="🏴‍☠️", image_prompt="Sci-fi space pirate captain with cybernetic eye, menacing, futuristic armor"),
            StoryBeat(type=BeatType.VICTORY, title="Pirates Defeated", text="💥 You outmaneuvered them! Photon torpedoes away! Captain Vex's ship spirals into the asteroid field!", image_url="✨", reward_points=50, reward_badge="Star Captain"),
            StoryBeat(type=BeatType.CHALLENGE, title="Alien Invasion Begins", text="👽 A massive alien fleet emerges from a wormhole! The Zorgon Empire has come for Earth!", villain_name="Zorgon Scouts", image_url="🛸", image_prompt="Alien fleet emerging from wormhole, threatening UFOs in space"),
            StoryBeat(type=BeatType.VICTORY, title="Scouts Destroyed", text="🌟 The scouts are eliminated! But the real fleet is still coming...", image_url="💫", reward_points=75, reward_badge="Galaxy Guardian"),
        ]),
        StoryAct(act_number=2, title="Act II: The Empire Strikes", beats=[
            StoryBeat(type=BeatType.PLOT_TWIST, title="The Mole", text="🔍 Your AI reveals a traitor on the council! 'The Empire knew your every move because of them.'", image_url="🤖"),
            StoryBeat(type=BeatType.CHALLENGE, title="Mothership Approaches", text="🌑 The Zorgon mothership eclipses the sun! 'Surrender or be annihilated!'", villain_name="Zorgon Mothership", image_url="🛸", image_prompt="Massive alien mothership eclipsing a planet, epic sci-fi scale"),
            StoryBeat(type=BeatType.VICTORY, title="Mothership Crippled", text="🎯 Direct hit on the reactor! The mothership retreats!", image_url="💥", reward_points=75, reward_badge="Fleet Commander"),
        ]),
        StoryAct(act_number=3, title="Act III: Battle for Earth", beats=[
            StoryBeat(type=BeatType.CHALLENGE, title="Emperor Zorgon", text="👑 Emperor Zorgon himself descends! 'You've been a worthy adversary. But this ends now.'", villain_name="Emperor Zorgon", image_url="👽", image_prompt="Powerful alien emperor with crown, fierce expression, sci-fi throne room"),
            StoryBeat(type=BeatType.FINALE, title="EARTH IS SAVED!", text="🌍 With one final shot, Emperor Zorgon's flagship explodes! Humanity is safe! You return home a legend! 🏆", image_url="👑", reward_points=100, reward_badge="Savior of Earth"),
        ]),
    ]
)

# ============== MEDIEVAL QUEST STORY ==============
MEDIEVAL_QUEST_STORY = Story(
    id="medieval-quest",
    title="The Knight's Honor",
    description="A noble knight on a quest to save the kingdom from an ancient evil.",
    theme="medieval",
    icon="⚔️",
    color_primary="#dc2626",
    color_secondary="#7f1d1d",
    total_acts=3,
    total_points=300,
    acts=[
        StoryAct(act_number=1, title="Act I: The Quest Begins", beats=[
            StoryBeat(type=BeatType.INTRO, title="The King's Summons", text="🏰 King Aldric summons you: 'Brave knight, our kingdom is in peril. The Dark Sorcerer Malakar threatens us all!'", image_url="👑", image_prompt="Medieval king on throne in grand castle hall, fantasy"),
            StoryBeat(type=BeatType.CHALLENGE, title="Goblin Ambush", text="🗡️ As you ride through the forest, goblins leap from the shadows! Chief Grimtooth grins: 'Your head will make a fine trophy!'", villain_name="Chief Grimtooth", image_url="👹", image_prompt="Fierce goblin chief in dark forest with crude weapons, fantasy art"),
            StoryBeat(type=BeatType.VICTORY, title="Goblins Defeated", text="⚔️ Your sword flashes! The goblins flee in terror! Chief Grimtooth swears revenge before vanishing.", image_url="🛡️", reward_points=50, reward_badge="Forest Hero"),
            StoryBeat(type=BeatType.CHALLENGE, title="The Dragon's Lair", text="🐉 A massive dragon blocks your path! 'Who dares enter my mountain?' Pyrothar's flames light the cave.", villain_name="Pyrothar the Dragon", image_url="🐲", image_prompt="Majestic red dragon in mountain cave, breathing fire, epic fantasy"),
            StoryBeat(type=BeatType.VICTORY, title="Dragon Tamed", text="✨ Through wisdom, not violence, you befriend Pyrothar! 'You are different. I will aid you, knight.'", image_url="🏆", reward_points=75, reward_badge="Dragon Friend"),
        ]),
        StoryAct(act_number=2, title="Act II: The Shadow Grows", beats=[
            StoryBeat(type=BeatType.PLOT_TWIST, title="The Royal Betrayal", text="🌑 You discover the truth - the king's advisor is in league with Malakar! The kingdom is rotting from within.", image_url="🗝️"),
            StoryBeat(type=BeatType.CHALLENGE, title="The Wraith Army", text="👻 Undead wraiths attack the castle! 'You cannot stop us, mortal!' Their leader, Nightshade, laughs coldly.", villain_name="Nightshade", image_url="💀", image_prompt="Dark wraith with glowing eyes in haunted castle, ghostly fantasy"),
            StoryBeat(type=BeatType.VICTORY, title="Light Conquers Dark", text="✨ Holy magic blazes from your sword! The wraiths dissolve into mist!", image_url="⚡", reward_points=75, reward_badge="Light Bringer"),
        ]),
        StoryAct(act_number=3, title="Act III: The Final Battle", beats=[
            StoryBeat(type=BeatType.CHALLENGE, title="Malakar the Dark Sorcerer", text="🔮 Atop the dark tower, Malakar awaits. 'You're brave... and foolish. The world will be MINE!'", villain_name="Malakar", image_url="🧙", image_prompt="Dark sorcerer with glowing staff, hooded robes, evil aura, dark tower"),
            StoryBeat(type=BeatType.FINALE, title="HERO OF THE REALM!", text="⚔️ With one heroic strike, Malakar falls! The kingdom celebrates! The king kneels before you: 'Arise, Knight of Legend!' 👑", image_url="🌟", reward_points=100, reward_badge="Legendary Knight"),
        ]),
    ]
)

# ============== DETECTIVE MYSTERY STORY ==============
DETECTIVE_MYSTERY_STORY = Story(
    id="detective-noir",
    title="Shadows of the City",
    description="A hardboiled detective solves the city's darkest mysteries.",
    theme="noir",
    icon="🕵️",
    color_primary="#1f2937",
    color_secondary="#111827",
    total_acts=3,
    total_points=300,
    acts=[
        StoryAct(act_number=1, title="Act I: The Case Begins", beats=[
            StoryBeat(type=BeatType.INTRO, title="Midnight in the City", text="🌃 Rain pours down 5th Avenue. A woman in red enters your office: 'Detective, my husband's been murdered. The cops won't help. Will you?'", image_url="🚬", image_prompt="Noir detective office at night, rain on window, femme fatale silhouette"),
            StoryBeat(type=BeatType.CHALLENGE, title="The First Clue", text="🔍 The crime scene is wrong. Too clean. A henchman, Sal 'The Knife', spots you snooping: 'You shouldn't have come here.'", villain_name="Sal 'The Knife'", image_url="🔪", image_prompt="Noir mafia henchman with knife in dark alley, fedora hat, rainy"),
            StoryBeat(type=BeatType.VICTORY, title="Sal Subdued", text="👊 A swift right hook, Sal's down! But not before he gives up a name: 'The boss... at the Blue Moon Club...'", image_url="🃏", reward_points=50, reward_badge="Sharp Detective"),
            StoryBeat(type=BeatType.CHALLENGE, title="The Blue Moon Trap", text="🎭 The Blue Moon Club. Jazz blares as bodyguards close in. 'Boss said no questions, detective.'", villain_name="Club Bodyguards", image_url="🎷", image_prompt="1940s noir jazz club, gangsters in suits, smoky atmosphere"),
            StoryBeat(type=BeatType.VICTORY, title="Escape from the Club", text="🌪️ A chair through the window, a leap into the alley! Free, but with vital information!", image_url="💼", reward_points=75, reward_badge="Quick Thinker"),
        ]),
        StoryAct(act_number=2, title="Act II: The Plot Deepens", beats=[
            StoryBeat(type=BeatType.PLOT_TWIST, title="The Widow's Lies", text="💄 The woman in red... was the murderer all along. She framed you for the second killing.", image_url="💋"),
            StoryBeat(type=BeatType.CHALLENGE, title="On the Run", text="🚓 Police chase you through the city! 'Stop, Detective! You're under arrest!' You need to find proof.", villain_name="Corrupt Police", image_url="🚔", image_prompt="Noir police chase scene, rainy night, detective running, classic 1940s"),
            StoryBeat(type=BeatType.VICTORY, title="Evidence Secured", text="📁 You find the safe deposit box! Inside: the proof of her crimes!", image_url="🗝️", reward_points=75, reward_badge="Master Sleuth"),
        ]),
        StoryAct(act_number=3, title="Act III: Justice Served", beats=[
            StoryBeat(type=BeatType.CHALLENGE, title="The Femme Fatale", text="🌹 'Clever boy.' She points a pistol at you. 'But not clever enough.' The Black Widow has come for you.", villain_name="The Black Widow", image_url="🕷️", image_prompt="Noir femme fatale in red dress with pistol, dramatic shadows, vintage"),
            StoryBeat(type=BeatType.FINALE, title="CASE CLOSED!", text="🎯 You disarm her with a swift move! Police arrive - the REAL ones. 'Detective, you've cracked the biggest case in city history!' 📰", image_url="🏆", reward_points=100, reward_badge="Master Detective"),
        ]),
    ]
)

# ============== ZOMBIE SURVIVAL STORY ==============
ZOMBIE_SURVIVAL_STORY = Story(
    id="zombie-apocalypse",
    title="Dawn of the Dead",
    description="Survive the zombie apocalypse and lead survivors to safety.",
    theme="horror",
    icon="🧟",
    color_primary="#10b981",
    color_secondary="#064e3b",
    total_acts=3,
    total_points=300,
    acts=[
        StoryAct(act_number=1, title="Act I: Outbreak", beats=[
            StoryBeat(type=BeatType.INTRO, title="The First Day", text="🌃 You wake to screams. The radio crackles: 'Stay inside. The dead are walking.' Civilization has fallen.", image_url="📻", image_prompt="Post-apocalyptic city street at dawn, abandoned cars, eerie silence"),
            StoryBeat(type=BeatType.CHALLENGE, title="Horde at the Door", text="🧟 Zombies pound at your door! A swarm of the infected, led by what was once your neighbor, breaks through!", villain_name="Infected Horde", image_url="🦠", image_prompt="Zombie horde breaking through door, terrifying undead, horror"),
            StoryBeat(type=BeatType.VICTORY, title="Horde Repelled", text="🔨 Crowbar in hand, you push them back! Your home is secure... for now.", image_url="🛡️", reward_points=50, reward_badge="Survivor"),
            StoryBeat(type=BeatType.CHALLENGE, title="The Raiders", text="🔫 Worse than zombies - other survivors. 'Drop your supplies, friend.' Their leader, Marcus, has cold eyes.", villain_name="Marcus the Raider", image_url="⚔️", image_prompt="Post-apocalyptic raider with weapons, scarred face, menacing"),
            StoryBeat(type=BeatType.VICTORY, title="Raiders Outsmarted", text="🎒 You lured them into a trap! Their supplies are now yours, and you saved a family!", image_url="🤝", reward_points=75, reward_badge="Protector"),
        ]),
        StoryAct(act_number=2, title="Act II: Finding Hope", beats=[
            StoryBeat(type=BeatType.PLOT_TWIST, title="The Cure?", text="🧪 A radio broadcast: 'Scientists at Site Alpha have a cure. But the facility is overrun...' Hope returns.", image_url="📡"),
            StoryBeat(type=BeatType.CHALLENGE, title="The Tyrant", text="🧟‍♂️ Site Alpha. A massive, evolved zombie - 'Patient Zero' - blocks the lab entrance!", villain_name="Patient Zero", image_url="🧟", image_prompt="Massive evolved zombie boss, mutated horror creature, terrifying"),
            StoryBeat(type=BeatType.VICTORY, title="Patient Zero Down", text="💥 Explosives planted, detonated! Patient Zero falls! The lab is yours!", image_url="🔬", reward_points=75, reward_badge="Hope Bringer"),
        ]),
        StoryAct(act_number=3, title="Act III: Salvation", beats=[
            StoryBeat(type=BeatType.CHALLENGE, title="The Mad Scientist", text="⚗️ Dr. Crowe was behind the outbreak! 'I'll release wave 2 before you stop me!' He activates the second virus.", villain_name="Dr. Crowe", image_url="🧬", image_prompt="Mad scientist in lab with glowing virus vial, horror, evil"),
            StoryBeat(type=BeatType.FINALE, title="MANKIND SAVED!", text="💉 The cure is distributed worldwide! Humanity will rebuild! You're the hero of a new world! 🌅", image_url="🌟", reward_points=100, reward_badge="World Savior"),
        ]),
    ]
)

# ============== PIRATE ADVENTURE STORY ==============
PIRATE_ADVENTURE_STORY = Story(
    id="pirate-treasure",
    title="The Lost Treasure of Captain Kidd",
    description="Sail the seven seas in search of the greatest treasure ever buried.",
    theme="pirate",
    icon="🏴‍☠️",
    color_primary="#0891b2",
    color_secondary="#155e75",
    total_acts=3,
    total_points=300,
    acts=[
        StoryAct(act_number=1, title="Act I: Setting Sail", beats=[
            StoryBeat(type=BeatType.INTRO, title="The Old Map", text="🗺️ A dying sailor presses a tattered map into your hand: 'The treasure... of Captain Kidd... find it... before they do.'", image_url="📜", image_prompt="Old pirate treasure map on weathered table, candle light, vintage"),
            StoryBeat(type=BeatType.CHALLENGE, title="The Royal Navy", text="⚓ HMS Vengeance bears down on you! Captain Harrington raises his cutlass: 'Pirates! Surrender or die!'", villain_name="Captain Harrington", image_url="⚔️", image_prompt="British naval captain on warship, period uniform, dramatic"),
            StoryBeat(type=BeatType.VICTORY, title="Navy Outrun", text="🌊 Skillful sailing! You vanish into the fog before their cannons can find you!", image_url="🌫️", reward_points=50, reward_badge="Sea Dog"),
            StoryBeat(type=BeatType.CHALLENGE, title="The Kraken Awakens", text="🐙 The ocean churns! A massive Kraken rises from the depths! Tentacles smash against your hull!", villain_name="The Kraken", image_url="🐙", image_prompt="Giant kraken attacking pirate ship, massive tentacles, stormy seas"),
            StoryBeat(type=BeatType.VICTORY, title="Kraken Defeated", text="⚓ Harpoons fly! The Kraken retreats with a thunderous roar back to the abyss!", image_url="🌊", reward_points=75, reward_badge="Kraken Slayer"),
        ]),
        StoryAct(act_number=2, title="Act II: The Cursed Isle", beats=[
            StoryBeat(type=BeatType.PLOT_TWIST, title="Mutiny!", text="🗡️ Your first mate, Quartermaster Jack, draws his sword! 'The treasure is mine!' Half the crew sides with him.", image_url="⚓"),
            StoryBeat(type=BeatType.CHALLENGE, title="Ghost Ship Attack", text="👻 The Flying Dutchman appears! Captain Davy Jones laughs: 'No living soul leaves these waters!'", villain_name="Davy Jones", image_url="💀", image_prompt="Ghostly pirate captain Davy Jones on phantom ship, supernatural"),
            StoryBeat(type=BeatType.VICTORY, title="Dutchman Banished", text="✨ Holy salt banishes the spirits! The Dutchman sinks back into the mist!", image_url="⚓", reward_points=75, reward_badge="Spirit Bane"),
        ]),
        StoryAct(act_number=3, title="Act III: The Treasure", beats=[
            StoryBeat(type=BeatType.CHALLENGE, title="Blackbeard's Curse", text="🏴‍☠️ At the treasure cave, the legendary Blackbeard rises! 'Ye dare claim MY gold? Then ye'll join me crew of the dead!'", villain_name="Blackbeard", image_url="⚔️", image_prompt="Legendary pirate Blackbeard with burning fuses in beard, fierce, mystical"),
            StoryBeat(type=BeatType.FINALE, title="TREASURE CLAIMED!", text="💰 A clever trick breaks the curse! Blackbeard fades away! The treasure of Captain Kidd is YOURS! 👑", image_url="💎", reward_points=100, reward_badge="Pirate King"),
        ]),
    ]
)


ALL_STORIES = [
    WILD_WEST_STORY,
    SPACE_MISSION_STORY,
    MEDIEVAL_QUEST_STORY,
    DETECTIVE_MYSTERY_STORY,
    ZOMBIE_SURVIVAL_STORY,
    PIRATE_ADVENTURE_STORY,
]


def get_story_by_id(story_id: str):
    for story in ALL_STORIES:
        if story.id == story_id:
            return story
    return None
