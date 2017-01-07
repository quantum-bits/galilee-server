# Data Design

This write-up details some of the design decisions
around data modeling and storage for Galilee.

## Definitions

We use the following terms with specific intent.

* **Reading**
  Scripture passage around which everything orbits.
* **Practice**
  Shorthand for _Scripture Engagement Practice_
* **Step**
  Incremental guidance
  about how to apply a practice to a reading
* **Resource**
  Image, audio, or video.

### Comments

* That a __step__ represents _incremental_ guidance
  means that a practice can be decomposed into
  "bite-sized" pieces of direction for engaging
  a reading with a particular practice.
  For example, _Lectio Divina_
  comprises _reading_, _meditation_, _prayer_,
  and _contemplation_.
  (See also the way in which
  [Sacred Space](http://www.sacredspace.ie/)
  segments daily prayer into
  _presence_, _freedom_, _consciousness_, etc.)
* Our initial idea for a __resource__
  was more generic than image, audio, or video
  (e.g., links to other web pages).
  Phil clarified that only these three types of resources
  are used in the actual content,
  so we don't need to be more generic.

## Details

* A __reading__ contains one or more contiguous ranges of verses
  (e.g., _Matthew 5.1-12_ or _Luke 2.1-5, 9-11_).
* A __reading__ has one or more associated __practices__.
* A __practice__ comprises
    1. A __summary__ of the practice that can serve as a _quick_,
     generic reminder of what the practice entails;
     not tied to a specific reading;
     displayed to the user as an introductory
     page when they choose a practice for a reading;
     user can instruct the system to
     skip this page on a per-practice basis.
    2. A __description__ of the practice that goes into more detail;
     corresponds basically to the static descriptions of
     practices currently on Bible Gateway;
     should be widely accessible
     form a "help" button or icon
    3. The __steps__ that make up the practice;
     steps provide incremental direction to the user
     on how to apply the practice to the reading;
     there may be one or more such steps per practice;
     if there is more than one step,
     users will be able to advance
     at their own pace
     from one step to the next
     (e.g., using left and right arrow images)
* A __step__ contains
    1. Zero or more __resources__
    1. Arbitrary text detailing the step;
     if the step contains one or more resource,
     the text would likely describe how to use the resource
     as part of the practice
     (e.g., "Consider how this painting expresses...").
* A __resource__ may be re-used arbitrarily
  (in different steps and in different practices);
  when the user initially views the step,
  any resource it contains will be displayed
  at a reduced size (e.g., image thumbmail, song icon)
  in a manner graphically connected to its
  associated step;
  users can "expand" the  resource as follows:
    1. _View an image_ by expanding it on the screen
     (e.g., with a "light box" effect)
    2. _Watch a video_ by expanding it on the screen
     or making it full screen
    3. _Hear a song_ by clicking on its icon

## Applying Practices

The __step__
provides a rich and flexible way to
detail the application of a scripture engagement
__practice__ to a particular __reading__.
Although the _summary_ and _description_
of a practice will be fixed per practice,
the _steps_ that apply the practice to a reading
may be completely customized.

Steps may vary from reading to reading,
_even for the same practice_.
For example, the _Singing Scripture_ practice
for one reading may highlight two songs,
each discussed and linked in its own step.
For another reading,
the same practice may only have
one song associated with it,
and therefore only one step.

### Tools for Applying Practices

We don't anticipate
that _every_ step
of _every_ practice
for _every_ reading
will be hand-crafted from scratch.
We will need to identify a mechanism
by which authors of content can, for example:

1. Reuse one or more previously created steps as-is
1. Reuse all the steps for applying a practice
   to a previously entered reading.
1. Reuse one or more steps previously created
   as a "template" for a new reading.
1. Identify standard "default" templates
   for each practice.

Before implementing any of these capabilities,
we need more experience with how content is created.
Such features will _not_ be in the initial release
of the system.

## User-Contributed Resources

Previous system designs assumed a relatively
loose connection between resources (images, video, audio),
practices, and readings.
However, in the current design,
resources only appear in steps.
Because users don't create steps for practices,
we need another mechanism for them to publish
group-specific resources.

Interaction between group members on the site
takes place in the context of a group forum,
in which group members can post comments.
In Galilee,
posts will also allow the user to include
a resource.
This design provides a satisfying symmetry:

* Content creators attach resources to
  a step of a practice,
  directly connecting the resource to the step.
* Users attach resources to
  a post in a forum,
  directly connecting the resource to the post.

## Personal Journal

The journal feature provides
users a place to write reflectively
about their experience with the site.
The journal window will always be available
while a user engages a reading.
Users can:

* Review previous journal entries
* Create a new journal entry at any time

We don't require journal entries
to be specific to any site content.
However, in order to contextualize journal content,
we record the following information
when a user creates a new journal entry:

1. Current date and time
1. Current reading
1. If the user is viewing a step of a practice,
   the current practice and step

When a user reviews previous journal entries,
this information will be accessible.
